const { chromium } = require('playwright');
const axios = require("axios");
const { parseString } = require("xml2js");
const fs = require('fs');

// Logging streams
const logStream = fs.createWriteStream('searcher_log.log', { flags: 'a' }); // Main log
const errorStream = fs.createWriteStream('matched_results.log', { flags: 'a' }); // ERRORS and RESULTS log

// Получение аргументов для поиска
const searchArgs = process.argv.slice(2); // All arguments after script calling

if (searchArgs.length === 0) {
    console.error("ERROR: You should enter at last one argument for searching.");
    process.exit(1);
}

// Parsing URLs from sitemap
function parseSitemap(xml) {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                const urls = result.urlset.url.map((url) => url.loc[0]);
                resolve(urls);
            }
        });
    });
}

// Getting URLs from sitemap
async function getSitemapURLs(sitemapUrl) {
    try {
        const { data } = await axios.get(sitemapUrl);
        return await parseSitemap(data);
    } catch (error) {
        const errorMsg = `ERROR during getting URLs from sitemap ${sitemapUrl}, ${error.message}`;

        errorStream.write(errorMsg + '\n'); // Logging errors to file
        console.error(errorMsg);
        return [];
    }
}

// Main func
(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        bypassCSP: true, // ignoring Content Security Policy
        ignoreHTTPSErrors: true, //  ignoring errors HTTPS
        permissions: ['notifications'], // permissions for sendind notifications for some pages (if needed)
        viewport: { width: 1280, height: 1024 } // browser`s window size
    });
    const page = await context.newPage();

    // turning off caches
    await page.route('**/*', (route) => {
        route.continue({ headers: { ...route.request().headers(), 'Cache-Control': 'no-cache' } });
    });

    //turning off caches
    const sitemapURL = 'https://frozzy.hsdevops.net/sitemap.xml'; // URL with sitemap

    // Getting list of pages from sitemap
    const urls = await getSitemapURLs(sitemapURL);

    // listening network requests on page
    page.on('request', (request) => {
        const requestUrl = request.url();

        // Logging every request
        const logMessage = `Loading: ${requestUrl}`;
        console.log(logMessage);
        logStream.write(logMessage + '\n'); // writting all in one log

        // Checking for matches arguments in URL`s
        searchArgs.forEach(arg => {
            if (requestUrl.includes(arg)) {
                const matchMessage = `MATCHES FOUND: ${requestUrl} has ${arg}!`;
                console.log(matchMessage);
                errorStream.write(matchMessage + '\n'); // writting matches to matched_results.log
                console.error(matchMessage);

            }
        });
    });

    // Checking every page from sitemap
    for (const url of urls) {
        const openingMessage = `Opening page: ${url}`;
        console.log(openingMessage);

        logStream.write(openingMessage + '\n'); // logging page opening

        try {
            await page.goto(url, { waitUntil: "networkidle" }); // waiting untill all requests ends
            const successMessage = `Page loaded successfully: ${url}`;
            console.log(successMessage);
            logStream.write(successMessage + '\n'); // Logging successful loading

            // adding timeout for waiting all downloads
            await page.waitForTimeout(5000); // 5 secs waiting
        } catch (error) {
            const errorMessage = `ERROR during loading: ${url}, ${error.message}`;
            console.log(errorMessage);
            errorStream.write(errorMessage + '\n'); // Logging errors
            console.error(errorMessage);

        }
    }

    await browser.close();
    logStream.end();
    errorStream.end();
})();


