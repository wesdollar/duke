const puppeteer = require('puppeteer');

const headless = false

async function getCategories(page) {

    await page.goto('http://books.toscrape.com/catalogue/category/books/travel_2/index.html')

    return await page.evaluate(() => {

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
}

async function getCategoryResultsCount(page, href) {

    await page.goto(href)

    return await page.evaluate(() => {

        return document.querySelector('#default > div > div > div > div > form > strong').innerText
    })
}

async function getAllCategoriesWithResultsCount() {

    const browser = await puppeteer.launch({ headless: headless }) // {headless: false}
    const page = await browser.newPage()

    let categories = await getCategories(page)

    let data = []

    for (let i = 0; i < categories.length; i++) {

        let count = await getCategoryResultsCount(page, categories[i].href)

        data.push({

            title: categories[i].title,
            count: count
        })
    }

    browser.close()

    return data
}

getAllCategoriesWithResultsCount().then((value) => {

    console.log(value); // Success!
})