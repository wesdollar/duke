## Duke Data Scraper

Prerequisites: nodejs w/ npm

### Installation
1. Clone the repo locally
2. From within repo directory, run `npm install` to install all dependencies
3. To execute script, run `node [script].js`
4. To manually stop script, press `ctrl + c` from active CLI.

## File & Directory Descriptions
* `./lawyer-data/` contains individual lawyer data in json files
* `./practice-areas/` contains lists of all lawyers' URLs in json files
* `./all-lawyers.json` contains all lawyer data compiled via `compile-lawyers.js` from data within `./lawyer-data/`
* `./all-lawyers-hrefs.json` contains all lawyers's URLs compiled via `compile-lawyer-hrefs.js` from data within `./practice-areas/`
* `./compile-lawyer-hrefs.js` reads data within `./practice-areas/` and compiles to `./all-lawyers-hrefs.json`
* `./compile-lawyers.js` reads data within `./lawyer-data/` and compiles to `./all-lawyers.json`
* `./scrape-lawyers.js` grabs the data for individual lawyers by digesting `./all-lawyers-hrefs.json`
* `./scrape-practice-areas.js` traverses Avvo's directory structure to grab URLs for lawyers
* `./scrape-results-all-practice-areas.sjon` *(you will not interact with this file)* this file is consumed by `./scrape-practice-areas.js` 

## Steps to Scrape All Data

1. Run `node scrape-practice-areas.js` to scrape the URLs for all of the individual Lawyer pages.
2. Run `node compile-lawyer-hrefs.js` to compile all of the Lawyer's hrefs into one file for consumption.
3. Run `node scrape-lawyers.js` to scrape each lawyer's data.
4. Run `node compile-lawyers.js` to compile all lawyer data into one file.

### Step 1: scrape-practice-areas.js

`scrape-practice-areas.js` is responsible for grabbing all of the URLs for each Lawyer in every practice area in every state. Once the entire practice area has been scraped, it is removed from the all-practice-areas array so that the script can be successfully resumed in case of error, timeout, or resuming scrape.

### Step 2: compile-lawyer-hrefs.js

`compile-lawyer-hrefs.js` will read all of the data saved in `practice-areas` and compile it into one file to be consumed by `scrape-lawyers.js`

### Step 3: scrape-lawyers.js

`scrape-lawyers.js` will visit each URL listed in  `all-lawyers-hrefs.json` and write the data scraped for each lawyer to a file in `lawyer-data` named after the lawyer and prefaced with the state in which they are located.

### (optional) Step 4: compile-lawyers.js 

`compile-lawyers.js` will combine all data for each lawyer into a single file for easy consumption.

### Troubleshooting

**Dealing with Timeouts**:
It's possible for a timeout to occur under some circumstances. If this happens, simple hit `ctrl + c` and restart the script. All previously scraped data will be preserved. 