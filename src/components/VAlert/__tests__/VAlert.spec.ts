import { mount } from '@vue/test-utils'
import puppeteer from 'puppeteer'
import VAlert from '../VAlert.vue'

describe('VAlert', () => {
  test('uses mounts', async () => {
    const wrapper = mount(VAlert)
    expect(wrapper.html()).toContain('this is an alert')
  })

  test('snapshot', async () => {
    const wrapper = mount(VAlert)
    expect(wrapper.html()).toMatchSnapshot()
  })

  test('image snapshot', async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('http://localhost:3000/dev')
    const image = await page.screenshot()
    expect(image).toMatchImageSnapshot()
    await browser.close()
  })
})
