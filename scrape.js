const puppeteer = require('puppeteer');

const headless = true

async function getCategories() {

    const browser = await puppeteer.launch({ headless: headless }) // {headless: false}
    const page = await browser.newPage()

    await page.goto('http://books.toscrape.com/catalogue/category/books/travel_2/index.html')

    if (!headless) {

        await page.setViewport({ width: 1200, height: 1040 })
        await page.waitFor(2000)
    }

    const allCategories = await page.evaluate(() => {

        let data = []

        let categories = document.querySelectorAll('.nav ul li')

        // return categories

        for (let i = 0; i < categories.length; i++) {

            let title = categories[i].innerText
            let link = categories[i].querySelector('a').href

            data.push({
                title: title,
                href: link,
            })
        }

        return data
    })

    browser.close()

    return allCategories
}

async function getCategoryResultsCount(href) {

    const browser = await puppeteer.launch({ headless: headless }) // {headless: false}
    const page = await browser.newPage()

    await page.goto(href)

    const count = await page.evaluate(() => {

        return document.querySelector('#default > div > div > div > div > form > strong').innerText
    })

    browser.close()

    return count
}

async function getAllCategoriesWithResultsCount() {

    let categories = await getCategories()
    let data = []

    for (let i = 0; i < categories.length; i++) {

        let count = await getCategoryResultsCount(categories[i].href)

        data.push({

            title: categories[i].title,
            count: count
        })
    }

    return data
}

getAllCategoriesWithResultsCount().then((value) => {
    console.log(value); // Success!
});