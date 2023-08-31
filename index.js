const puppeteer = require('puppeteer')
const dotenv = require('dotenv')
const fs = require('fs')
dotenv.config()

const program = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    })
    const page = await browser.newPage()

    // Go to the page you want to test
    await page.goto(
        'https://sso.hcmut.edu.vn/cas/login?service=https://mybk.hcmut.edu.vn/my/homeSSO.action'
    )

    // Get the username and password field
    const usernameField = await page.$('#username')
    const passwordField = await page.$('#password')

    // Fill the form
    await usernameField.type(process.env.USER_NAME)
    await passwordField.type(process.env.PASSWORD)

    // Submit login form
    const submitButton = await page.$('.btn-submit')
    await submitButton.click()

    await page.waitForNavigation() // Wait for the page to redirect.

    // Get the stinfo link element.
    const stinfoLink = await page.$(
        'body > div.content_wapper.padding > div > div > div.col-md-12 > div:nth-child(1) > div > div.box-body > div > div:nth-child(3) > div > div > span:nth-child(1) > a'
    )

    if (stinfoLink) {
        // Declare promise.
        const newPagePromise = new Promise((resolve) =>
            browser.once('targetcreated', (target) => resolve(target.page()))
        )

        await stinfoLink.click() // Click on the stinfo.

        const newPage = await newPagePromise // Declare newPage as the page which is created by the link click.

        // Change focus to the new tab.
        await newPage.bringToFront()

        // ** Use newPage from here on. **

        // Get the schedule button element.
        try {
            const scheduleButton = await newPage.waitForSelector(
                '#menu-188 > div.menu-box-wp'
            )

            await newPage.waitForTimeout(2200) // Wait for the page to load.
            await scheduleButton.click()

            console.log('Clicked on schedule button successfully!')
        } catch (error) {
            console.log('Something went wrong: ', error)
        }

        // Get the schedule title.
        try {
            const scheduleTitle = await newPage.waitForSelector(
                'div.lichhoc-content-div > div.lichhoc-all:first-of-type'
            )

            if (scheduleTitle) {
                const title = await newPage.evaluate(
                    (el) => el.textContent,
                    scheduleTitle
                )
                console.log('Title:', title) // Print the title.

                // Write the title to the file.
                fs.writeFileSync('schedule.txt', title + '\n\n', {
                    flag: 'a',
                })
            } else {
                console.log('Not found.')
            }
        } catch (error) {
            console.log(
                'Something went wrong when getting the schedule title: ',
                error
            )
        }

        // Get the schedule table.
        try {
            const scheduleTable = await newPage.waitForSelector(
                'div.content-tab-table > table.lichhoc-all:first-of-type'
            )

            const rows = await scheduleTable.$$('tr')
            for (const row of rows) {
                const columns = await row.$$('td') // Get the columns of each row.
                const rowData = []
                for (const column of columns) {
                    const cellData = await newPage.evaluate(
                        (el) => el.textContent,
                        column
                    )

                    rowData.push(cellData)
                }
                console.log(rowData)
                /*
                // Write all row data to the file.
                fs.writeFileSync('schedule.txt', rowData + '\n\n', {
                    flag: 'a',
                })
                */
            }
        } catch (error) {
            console.log(
                'Something went wrong when getting the schedule table: ',
                error
            )
        }
    }
}

// Run the program
program()
