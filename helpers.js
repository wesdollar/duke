module.exports = {

    cleanPracticeArea (str) {

        return str.substring(0, str.indexOf(':'))
    },

    async getTextContent (page, el) {

        if (el !== null || undefined) {

            return await page.evaluate(() => {

                return el.textContent
            })
        }
        else {

            return ''
        }
    },
}