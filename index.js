import puppeteer from 'puppeteer'
;(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    })
    const page = await browser.newPage()

    // Set the viewport to your prefered size

    // Set the time for closing the browser automatically
    // setTimeout(async () => {
    //     await browser.close()
    // }, 5000)

    // Go to the page you want to test
    await page.goto(
        'https://sso.hcmut.edu.vn/cas/login?service=https://mybk.hcmut.edu.vn/my/homeSSO.action'
    )

    // Point to the login form
    const usernameField = await page.$('#username')
    const passwordField = await page.$('#password')

    // Fill the form
    await usernameField.type(process.env.USERNAME)
    await passwordField.type(process.env.PASSWORD)

    // Submit login form
    const submitButton = await page.$('.btn-submit')
    await submitButton.click()

    await page.waitForNavigation()

    const container = await page.$('div > div.box-body')

    const title = await page.evaluate((el) => el.innerText, container)

    // console.log(title)

    const linkToClick = await page.$(
        'body > div.content_wapper.padding > div > div > div.col-md-12 > div:nth-child(1) > div > div.box-body > div > div:nth-child(3) > div > div > span:nth-child(1) > a'
    )

    if (linkToClick) {
        // Declare promise
        const newPagePromise = new Promise((resolve) =>
            browser.once('targetcreated', (target) => resolve(target.page()))
        )

        await linkToClick.click() // Click on the link

        const newPage = await newPagePromise // Declare newPage as the page which is created by the link click

        // Change focus to the new tab
        await newPage.bringToFront()

        // Take a screenshot
        await newPage.screenshot({ path: 'screenshot.png' })
    }
})()
