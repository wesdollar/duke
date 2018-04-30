## Duke Data Scraper

Prerequisites: nodejs w/ npm

* Clone the repo locally
* From within cloned directory, run `npm install` to install all dependencies
* To execute script, run `node [script].js`
* To manually stop script, press `ctrl + c` from active CLI.

### Steps to Scrape All Data

1. Run `node scrape.js` to scrape the URLs for all of the individual Lawyer pages.
2. Run `node compile-lawyer-hrefs.js` to compile all of the Lawyer's hrefs into one file for consumption.
3. Run `node scrape-lawyers.js` to scrape each lawyer's data.
4. Run `node compile-lawyers.js` to compile all lawyer data into one file.

### Step 1: scrape.js

`scrape.js` is responsible for grabbing all of the URLs for each Lawyer in every practice area in every state. Once the entire practice area has been scraped, it is removed from the all-practice-areas array so that the script can be successfully resumed in case of error, timeout, or resuming scrape.

### Step 2: compile-lawyer-hrefs.js

`compile-lawyer-hrefs.js` will read all of the data saved in `practice-areas` and compile it into one file to be consumed by `scrape-lawyers.js`

### Step 3: scrape-lawyers.js

`scrape-lawyers.js` will visit each URL listed in  `all-lawyers-hrefs.json` and write the data scraped for each lawyer to a file in `lawyer-data` named after the lawyer and prefaced with the state in which they are located.

### (optional) Step 4: compile-lawyers.js 

`compile-lawyers.js` will combine all data for each lawyer into a single file for easy consumption.

### Troubleshooting

**Dealing with Timeouts**:
It's possible for a timeout to occur under some circumstances. If this happens, simple hit `ctrl + c` and restart the script. All previously scraped data will be preserved. 