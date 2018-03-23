const fs = require("fs")
const notifier = require('node-notifier')
const puppeteer = require('puppeteer')

const headless = true

async function getCategories(page, href) {

    await page.goto(href)

    return await page.evaluate(() => {

        let data = []

        let categories = document.querySelectorAll('.nav ul li')

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

async function parseAllProductPagesInCategory(page, href, categoryTitle) {

    let pages = await getAllProductLinksInCategory(page, href)

    let data = {
        meta: {
            title: categoryTitle,
            results: pages.length,
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

async function getAllProductLinksInCategory(page, href) {

    // return await getAllProductLinksOnPage(page, href)
    // let nextEl = document.querySelector('ul.pager li.next a')

    let results = await getCategoryResultsCount(page, href)
    let resultsPerPage = 20
    let pages = Math.ceil(results / resultsPerPage)

    let links = []

    for (let i = 0; i < pages; i++) {

        let next = await page.evaluate(() => {

            let nextEl = document.querySelector('ul.pager li.next a')

            if (nextEl) {

                return nextEl.href
            }
            else {

                return false
            }
        })

        if (next !== false) {

            links.push( await getAllProductLinksOnPage(page, href) )

            // navigate to the next page so the loop is on the next page when it starts over
            // await page.goto(next)

            href = next
        }
        else {

            links.push( await getAllProductLinksOnPage(page, href) )
        }
    }

    let data = []

    for (let i = 0; i < links.length; i++) {

        for (let j = 0; j < links[i].length; j++) {

            let link = links[i][j]

            data.push({
                title: link.title,
                href: link.href,
            })
        }
    }

    return data
}

async function getCategoryResultsCount(page, href) {

    await page.goto(href)

    return await page.evaluate(() => {

        return document.querySelector('#default > div > div > div > div > form > strong').innerText
    })
}

// async function getAllCategoriesWithResultsCount() {
//
//     const browser = await puppeteer.launch({ headless: headless }) // {headless: false}
//     const page = await browser.newPage()
//
//     let categories = await getCategories(page)
//
//     let data = []
//
//     for (let i = 0; i < categories.length; i++) {
//
//         let count = await getCategoryResultsCount(page, categories[i].href)
//         // let books = await getCategoryBooks(page, categories[i].href)
//
//         data.push({
//
//             title: categories[i].title,
//             count: count
//         })
//     }
//
//     browser.close()
//
//     return data
// }

async function run() {

    const browser = await puppeteer.launch({ headless: headless }) // {headless: false}
    const page = await browser.newPage()

    let entryHref = 'http://books.toscrape.com'

    let categories = await getCategories(page, entryHref)

    let result = []

    for (let i = 0; i < categories.length; i++) {

        result.push(await parseAllProductPagesInCategory(page, categories[i].href, categories[i].title))
    }

    browser.close()

    return result
}

run().then((result) => {

    // console.log(value)

    fs.writeFileSync('scrape-results.json', JSON.stringify(result))
    notifier.notify('Scrape complete!');
})

// async function test() {
//
//     const browser = await puppeteer.launch({ headless: headless }) // {headless: false}
//     const page = await browser.newPage()
//
//     let entryHref = 'http://books.toscrape.com/catalogue/category/books/thriller_37/index.html'
//
//     let result = await getAllProductLinksInCategory(page, entryHref)
//
//     browser.close()
//
//     return result
// }
//
// test().then((result) => {
//
//     fs.writeFileSync('scrape-results.json', JSON.stringify(result))
//     notifier.notify('Scrape complete!');
// })