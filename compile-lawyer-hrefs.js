const fs = require("fs")

async function run() {

    let directory = './practice-areas/'

    let files = fs.readdirSync(directory)

    let data = [];

    for (let i = 0; i < files.length; i++) {

        if (files[i] === '.DS_Store') {

            continue
        }

        let links = require(directory + files[i])

        for (let j = 0; j < links.length; j++) {

            data.push(links[j])
        }
    }

    fs.writeFileSync('all-lawyers-hrefs.json', JSON.stringify(data))
}

run().then((result) => {

})