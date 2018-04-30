## Duke Data Scraper

Prerequisites: nodejs w/ npm

* Clone the repo locally
* From within cloned directory, run `npm install` to install all dependencies
* To execute script, run `node scrape.js`
* To manually stop script, press `ctrl + c` from active CLI.

### Functionality of scrape.js

`scrape.js` is responsible for grabbing all of the URLs for each Lawyer in every practice area in every state. Once the entire practice area has been scraped, it is removed from the all-practice-areas array so that the script can be successfully resumed in case of error, timeout, or resuming scrape.

### Next Steps

Once all of the practice areas have been scraped to obtain the individual lawyers' URLs, you will need to run a second script to scrape the lawyers' data. This script and supporting documentation will be added when complete.