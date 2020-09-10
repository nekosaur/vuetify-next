import path from 'path'
import ts from 'rollup-plugin-typescript2'
import replace from '@rollup/plugin-replace'
import json from '@rollup/plugin-json'
import vue from 'rollup-plugin-vue'
import scss from 'rollup-plugin-scss'
import esmImportToUrl from 'rollup-plugin-esm-import-to-url'

const masterVersion = require('./package.json').version
const packageDir = path.resolve(__dirname)
const resolve = p => path.resolve(packageDir, p)
const pkg = require(resolve('package.json'))
const name = pkg.name
const packageOptions = pkg.buildOptions || {}

// ensure TS checks only once for each build
let hasTSChecked = false

let hasGeneratedCss = false

const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: 'es',
  },
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: 'cjs',
  },
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: 'iife',
    globals: {
      vue: 'Vue',
    },
  },
  esm: {
    file: resolve(`dist/${name}.esm.js`),
    format: 'es',
  },
}

console.log(process.env.FORMATS)

const defaultFormats = Object.keys(outputConfigs)
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',')
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats
const packageConfigs = process.env.PROD_ONLY
  ? []
  : packageFormats.map(format => createConfig(format, outputConfigs[format]))

if (process.env.NODE_ENV === 'production') {
  packageFormats.forEach(format => {
    if (format === 'cjs' && packageOptions.prod !== false) {
      packageConfigs.push(createProductionConfig(format))
    }
    if (format === 'global' || format === 'esm') {
      packageConfigs.push(createMinifiedConfig(format))
    }
  })
}

export default packageConfigs

function createConfig (format, output, plugins = []) {
  output.externalLiveBindings = false

  const isProductionBuild =
    process.env.__DEV__ === 'false' || /\.prod\.js$/.test(output.file)
  const isGlobalBuild = format === 'global'
  const isRawESMBuild = format === 'esm'
  const isBundlerESMBuild = /esm-bundler/.test(format)

  if (isGlobalBuild) {
    output.name = 'Vuetify'
  }

  const shouldEmitDeclarations =
    process.env.TYPES != null &&
    process.env.NODE_ENV === 'production' &&
    !hasTSChecked

  const tsPlugin = ts({
    check: process.env.NODE_ENV === 'production' && !hasTSChecked,
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations,
      },
      exclude: ['**/__tests__', 'test-dts'],
    },
  })
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true

  // we only need to generate css once
  const scssPlugin = scss({
    output: hasGeneratedCss ? false : resolve('dist/vuetify.css'),
  })
  hasGeneratedCss = true

  const entryFile = 'src/full.ts'

  return {
    input: resolve(entryFile),
    external: isRawESMBuild ? [] : ['vue'],
    plugins: [
      scssPlugin,
      vue({
        css: false,
      }),
      json({
        namedExports: false,
      }),
      tsPlugin,
      createReplacePlugin(
        isProductionBuild,
        isBundlerESMBuild,
        (isGlobalBuild || isRawESMBuild || isBundlerESMBuild) &&
          !packageOptions.enableNonBrowserBranches
      ),
      isRawESMBuild ? esmImportToUrl({
        imports: {
          vue: 'https://unpkg.com/vue@3.0.0-rc.10/dist/vue.esm-browser.js',
        },
      }) : undefined,
      ...plugins,
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    },
  }
}

function createReplacePlugin (
  isProduction,
  isBundlerESMBuild,
  isBrowserBuild
) {
  const replacements = {
    __COMMIT__: `"${process.env.COMMIT}"`,
    __VERSION__: `"${masterVersion}"`,
    __DEV__: isBundlerESMBuild
      // preserve to be handled by bundlers
      ? '(process.env.NODE_ENV !== \'production\')'
      : // hard coded dev/prod builds
      !isProduction,
    // this is only used during tests
    __TEST__: isBundlerESMBuild ? '(process.env.NODE_ENV === \'test\')' : false,
    // If the build is expected to run directly in the browser (global / esm builds)
    __BROWSER__: isBrowserBuild,
    // is targeting bundlers?
    __BUNDLER__: isBundlerESMBuild,
  }
  // allow inline overrides like
  // __RUNTIME_COMPILE__=true yarn build runtime-core
  Object.keys(replacements).forEach(key => {
    if (key in process.env) {
      replacements[key] = process.env[key]
    }
  })
  return replace(replacements)
}

function createProductionConfig (format) {
  return createConfig(format, {
    file: resolve(`dist/${name}.${format}.prod.js`),
    format: outputConfigs[format].format,
  })
}

function createMinifiedConfig (format) {
  const { terser } = require('rollup-plugin-terser')
  return createConfig(
    format,
    {
      file: resolve(`dist/${name}.${format}.prod.js`),
      format: outputConfigs[format].format,
    },
    [
      terser({
        module: /^esm/.test(format),
      }),
    ]
  )
}
