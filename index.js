const puppeteer = require('puppeteer')
const dotenv = require('dotenv')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

// Set up
const app = express()
dotenv.config()

// Destination URL
const mybkURL =
    'https://sso.hcmut.edu.vn/cas/login?service=https://mybk.hcmut.edu.vn/my/homeSSO.action'

// Middleware
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())

// Routes
// Client posts username and password to the server. Server uses puppeteer to login to mybk and scrape the schedule.
app.post('/', async (req, res) => {
    // Get the data from the request body.
    const { username, password } = req.body

    // Declare scrapedData object.
    const scrapedData = {
        title: [],
        table: [],
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: null,
    })
    const page = await browser.newPage()

    // Go to the page you want to test
    await page.goto(mybkURL)

    // Get the username and password field
    const usernameField = await page.$('#username')
    const passwordField = await page.$('#password')

    // Fill the form
    // await usernameField.type(process.env.USER_NAME)
    // await passwordField.type(process.env.PASSWORD)

    await usernameField.type(username)
    await passwordField.type(password)

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
            console.log(error)
        }

        // Get the schedule title element.
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
                scrapedData.title.push(title)
            }
        } catch (error) {
            res.status(500).json({ message: 'Not found.' })
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
            for (const [index, row] of rows.entries()) {
                // Skip the first and last row.
                if (index === 0 || index === rows.length - 1) {
                    continue
                }

                const columns = await row.$$('td') // Get the columns of each row.
                const rowData = []
                for (const column of columns) {
                    const cellData = await newPage.evaluate(
                        (el) => el.textContent,
                        column
                    )

                    rowData.push(cellData)
                }
                scrapedData.table.push(rowData)
                console.log(rowData)
            }

            res.status(200).json(scrapedData)
        } catch (error) {
            res.status(500).json({
                message:
                    'Something went wrong when getting the schedule table!!',
            })
        }
    } else {
        console.log(
            'Logged in failed, username or password is invalid, or something haha.'
        )
        res.status(401).json({ message: 'Wrong username or password.' })
    }
})

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
