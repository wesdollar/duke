const fs = require("fs")

async function run() {

    let directory = './lawyer-data/'

    let files = fs.readdirSync(directory)

    let data = []

    for (let i = 0; i < files.length; i++) {

        if (files[i] === '.DS_Store') {

            continue
        }

        let lawyerData = require(directory + files[i])

        data.push(lawyerData)
    }

    fs.writeFileSync('all-lawyers.json', JSON.stringify(data))
}

run().then((result) => {

})