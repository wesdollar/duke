const puppeteer = require('puppeteer');

const headless = true

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

async function getAllProductLinksOnPage(page, href) {

    await page.goto(href)

    return await page.evaluate(() => {

        let els = document.querySelectorAll('.product_pod')
        let data = []

        for (let i = 0; i < els.length; i++) {

            let el = els[i].querySelector('h3 a')
            let title = el.innerText
            let href = el.href

            data.push({
                title: title,
                href: href,
            })
        }

        return data
    })
}

async function parseAllProductPagesInCategory(page, href) {

    let pages = await getAllProductLinksOnPage(page, href)

    let data = {
        meta: {
            results: pages.length
        },
        results: [],
    }

    for (let i = 0; i < pages.length; i++) {

        let href = pages[i].href

        data.results.push(await getBookInfoByPage(page, href))
    }

    return data
}

async function getBookInfoByPage(page, href) {

    await page.goto(href)

    return await page.evaluate(() => {

        let title = document.querySelector('.product_main h1').innerText
        let price = document.querySelector('.product_main .price_color').innerText

        return {

            title: title,
            price: price,
        }
    })
}

async function getAllCategoriesWithResultsCount() {

    const browser = await puppeteer.launch({ headless: headless }) // {headless: false}
    const page = await browser.newPage()

    let categories = await getCategories(page)

    let data = []

    for (let i = 0; i < categories.length; i++) {

        let count = await getCategoryResultsCount(page, categories[i].href)
        // let books = await getCategoryBooks(page, categories[i].href)

        data.push({

            title: categories[i].title,
            count: count
        })
    }

    browser.close()

    return data
}

// getBookInfoByPage().then((value) => {
//
//     console.log(value); // Success!
// })

async function test() {

    const browser = await puppeteer.launch({ headless: headless }) // {headless: false}
    const page = await browser.newPage()

    let href = 'http://books.toscrape.com/catalogue/category/books/food-and-drink_33/index.html'

    let data = await parseAllProductPagesInCategory(page, href)

    browser.close()

    return data
}

test().then((value) => {

    console.log(value)
})