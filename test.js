const fs = require("fs")
const notifier = require('node-notifier')
const Confirm = require('prompt-confirm')

async function run() {

    let prompt = new Confirm({
        name: 'captcha',
        message: 'Did you solve the captcha?',
    })

    console.log('first')

    await prompt.run()
        .then((answer) => {

        handleResponse(answer)
    })

    console.log('second')

    // await notifier.notify({
    //     title: 'Wake up!',
    //     message: 'Solve the captcha before continuing.',
    //     wait: true,
    //     timeout: 60,
    //     actions: 'Proceed',
    //     closeLabel: 'Close',
    // });
}

async function handleResponse(answer) {

    await notifier.notify({
        title: 'Well done!',
        message: 'You solved the captcha!',
        closeLabel: 'Close',
    });
}

run().then((result) => {

    // console.log('hello there');

    // fs.writeFileSync('scrape-results-all-practice-areas.json', JSON.stringify(result))
})