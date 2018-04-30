const fs = require("fs")
const notifier = require('node-notifier')
const puppeteer = require('puppeteer')
const helpers = require('./helpers.js')
const Confirm = require('prompt-confirm')

const config = {
    headless: false,
    entryHref: 'https://www.avvo.com/find-a-lawyer/all-practice-areas/il'
    // entryHref: 'https://www.avvo.com/attorneys/35801-al-frank-ward-4315493.html'
}

async function captchaPrompt() {

    let prompt = new Confirm({
        name: 'captcha',
        message: 'Did you solve the captcha?',
    })

    return await prompt.run()
        .then((answer) => {

            return !!(answer) // todo: return error
        })
}

async function checkIfCaptcha(page) {

    return await page.evaluate(async () => {

        let captchaTitleEl = document.querySelector('.page-title-wrapper .page-title h1')

        // check if captcha page
        if (captchaTitleEl != null) {

            // registered in getLawyersInCategory
            await window.captchaPrompt()
        }

        return false
    })
        .catch((error) => {

            console.log('yes')

            return true
        })
}

async function getLawyersInCategory(page, href) {

    await page.goto(href, {'waitUntil' : 'networkidle0'})

    let pages = await getPageCountInPracticeArea(page, href)

    let links = []

    for (let i = 1; i <= pages; i++) {

        let url = href + '?utf8=%E2%9C%93&page=' + i + '&sort=relevancy'

        await page.goto(url, {'waitUntil' : 'networkidle0'})

        let isCaptcha = await checkIfCaptcha(page)

        // if (isCaptcha) {
        //
        //     await page.goto(url, {'waitUntil' : 'networkidle0'})
        // }

        let results = await page.evaluate(async () => {

            let els = document.querySelectorAll('.serp-headshot a')
            let data = []

            for (let i = 0; i < els.length; i++) {

                data.push({ href: els[i].getAttribute('href')})
            }

            return data
        })

        let pageTitle = await page.evaluate(() => {

            return document.querySelector('#lawyer-serp-title').textContent
        })

        pageTitle = pageTitle.replace(/\s+/g, '-').toLowerCase() + '-' + i

        let file = './practice-areas/' + pageTitle + '.json'

        // write one page results to a file
        fs.writeFileSync(file, JSON.stringify(results))

        // random pause
        // await page.waitFor(Math.random() * (5000 - 1000) + 1000)

        links.push(results)
    }

    let data = []

    for (let i = 0; i < links.length; i++) {

        for (let j = 0; j < links[i].length; j++) {

            let link = links[i][j]

            data.push({
                href: link.href,
            })
        }
    }

    return data
}

async function getPracticeAreasForState(page, href) {

    await page.goto(href, {'waitUntil' : 'networkidle0'})
    // await page.waitFor(1500)

    return await page.evaluate(() => {

        let cats = document.querySelectorAll('#a-z ul.link-list li a')

        let data = []

        for (let i = 0; i < cats.length; i++) {

            data.push({href: cats[i].getAttribute('href')})
        }

        return data
    })
}

async function getAllPracticeAreas(page, href) {

    let states = [{"state":"al"},{"state":"ak"},{"state":"as"},{"state":"az"},{"state":"ar"},{"state":"ca"},{"state":"co"},{"state":"ct"},{"state":"de"},{"state":"dc"},{"state":"fl"},{"state":"ga"},{"state":"hi"},{"state":"id"},{"state":"il"},{"state":"in"},{"state":"ia"},{"state":"ks"},{"state":"ky"},{"state":"la"},{"state":"me"},{"state":"md"},{"state":"ma"},{"state":"mi"},{"state":"mn"},{"state":"ms"},{"state":"mo"},{"state":"mt"},{"state":"ne"},{"state":"nv"},{"state":"nh"},{"state":"nj"},{"state":"nm"},{"state":"ny"},{"state":"nc"},{"state":"nd"},{"state":"oh"},{"state":"ok"},{"state":"or"},{"state":"pa"},{"state":"ri"},{"state":"sc"},{"state":"sd"},{"state":"tn"},{"state":"tx"},{"state":"ut"},{"state":"vt"},{"state":"va"},{"state":"wa"},{"state":"wv"},{"state":"wi"},{"state":"wy"}]

    let data = []

    for (let i = 0; i < states.length; i++) {

        let url = 'https://www.avvo.com/find-a-lawyer/all-practice-areas/' + states[i].state

        data.push(await getPracticeAreasForState(page, url))
    }

    return data
}

async function getPageCountInPracticeArea(page, href) {

    await page.goto(href, {'waitUntil' : 'networkidle0'})

    let isCaptcha = await checkIfCaptcha(page)

    // if (isCaptcha) {
    //
    //     await page.goto(href, {'waitUntil' : 'networkidle0'})
    // }

    return await page.evaluate(async () => {

        let resultsCount = document.querySelector('#title-total-count').innerText
        let resultsPerPage = 10

        return Math.ceil(resultsCount.replace( /[^\d.]/g, '' ) / resultsPerPage)
    })
}

async function getAllLawyersHrefInPracticeAreas(page, href) {

    await page.goto(href, {'waitUntil' : 'networkidle0'})

    let practiceAreas = require('./scrape-results-all-practice-areas')

    let data = []

    for (let i = 0; i < practiceAreas.length; i++) {

        let url = 'https://www.avvo.com' + practiceAreas[i].href

        data.push(await getLawyersInCategory(page, url))
    }

    return data
}

async function getLawyerData(page, href) {

    await page.goto(href, {'waitUntil' : 'networkidle0'})
    // await page.waitFor(3000)
    await page.waitForSelector('#resume td[data-title="Origin"]')

    await page.exposeFunction('cleanPracticeArea', helpers.cleanPracticeArea)
    // await page.exposeFunction('getTextContent', helpers.getTextContent)

    let data = await page.evaluate(async () => {

        function getTextContent(el) {

            return (el == null) ? '' : el.textContent
        }
        function getInnerText(el) {

            return (el == null) ? '' : el.innerText
        }

        function getPreviousSiblingTextContent(el) {

            return (el == null) ? '' : el.previousSibling.textContent
        }

        function getNextSiblingTextContent(el) {

            return (el == null) ? '' : el.nextSibling.textContent
        }

        function getAttribute(el, attr) {

            return (el == null) ? '' : el.getAttribute(attr)
        }

        // from "Copy of Lawyer Directory Template.xlsx" provided by Drew Duke
        // all lower-cased values are not contained with above spreadsheet
        let results = {
            // custom
            name: await getTextContent(document.querySelector('[itemprop="name"]')),

            // matches provided db design
            Address_Line_1: await getTextContent(document.querySelector('address p span').childNodes[0]),
            Address_Line_2: await getTextContent(document.querySelector('address p span span')),
            City: await getTextContent(document.querySelector('address p').childNodes[1]),
            State_Code: await getTextContent(document.querySelector('address p').childNodes[3]),
            Zip_Code: await getTextContent(document.querySelector('address p').childNodes[5]),

            // original value: document.querySelector('span.js-v-phone-replace-text').textContent
            // note: there are more than two possible results in node
            Phone: await getTextContent(document.querySelectorAll('span.js-v-phone-replace-text')[1]),

            Fax: await getTextContent(document.querySelectorAll('span.js-v-phone-replace-text')[2]),
            Firm_Name: await getTextContent(document.querySelector('address .h2')),
            Firm_Website: await getAttribute(document.querySelector('.js-address p[itemprop="url"]'), 'content'),
            Law_School: await getPreviousSiblingTextContent(document.querySelector('td[data-title="Degree"]')),
            Law_School_Graduation_Year: getTextContent(document.querySelector('td[data-title="Graduated"]').childNodes[0]),
            Law_School_Degree: getTextContent(document.querySelector('td[data-title="Degree"]').childNodes[0]),
            Bar_Admission: getTextContent(document.querySelector('#resume td[data-title="Status"]')),
            Bar_Admission_Year: getTextContent(document.querySelector('#resume td[data-title="Origin"]')),

            // todo: parse "2011 - Present"
            First_Year_Admitted_To_Practice: getNextSiblingTextContent(document.querySelector('td[data-title="Company name"]')),

            Practice_Area_1: await window.cleanPracticeArea(getInnerText(document.querySelectorAll('#practice_areas .js-specialty')[0])),
            Practice_Area_2: await window.cleanPracticeArea(getInnerText(document.querySelectorAll('#practice_areas .js-specialty')[1])),
            Practice_Area_3: await window.cleanPracticeArea(getInnerText(document.querySelectorAll('#practice_areas .js-specialty')[2])),
            Practice_Area_4: await window.cleanPracticeArea(getInnerText(document.querySelectorAll('#practice_areas .js-specialty')[3])),
            Practice_Area_5: await window.cleanPracticeArea(getInnerText(document.querySelectorAll('#practice_areas .js-specialty')[4])),

            // not available
            // Salutation: '',
            // First_Name: '',
            // Middle_Name: '',
            // Last_Name: '',
            // Suffix: '',
            // Gender: '',
            // Address_Line_3: '',
            // Address_Line_4: '',
        }

        return results
    })

    let cleanLawyerName = data.name.replace(/\s+/g, '-').toLowerCase()

    let file = './lawyer-data/' + data.State_Code + '-' +  cleanLawyerName + '.json'

    // write one page results to a file
    fs.writeFileSync(file, JSON.stringify(data))

    return data
}

async function run() {

    const browser = await puppeteer.launch({ headless: config.headless }) // {headless: false}
    const page = await browser.newPage()

    // for use inside checkIfCaptcha
    await page.exposeFunction('captchaPrompt', captchaPrompt)

    // disable resources we don't need
    // await page.setRequestInterception(true)
    // page.on('request', (request) => {
    //     if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
    //         request.abort();
    //     } else {
    //         request.continue();
    //     }
    // })

    let entryHref = config.entryHref

    // collect all lawyers from directory
    let result = []
    result.push(await getAllLawyersHrefInPracticeAreas(page, entryHref))

    // get one lawyer
    // let result = await getLawyerData(page, entryHref)

    browser.close()
    return result
}

run().then((result) => {

    // console.log(value)

    fs.writeFileSync('scrape-results.json', JSON.stringify(result))
    notifier.notify('Scrape complete!');
})