const fs = require("fs")

async function run() {

    let links = require('./scrape-results-all-practice-areas')

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

run().then((result) => {

    // console.log(value)

    fs.writeFileSync('scrape-results-all-practice-areas.json', JSON.stringify(result))
})