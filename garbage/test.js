const { chromium } = require('playwright');
const axios = require("axios");
const { parseString } = require("xml2js");

// Getting arguments for searching them in network requests
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
        console.error(`ERROR during getting URLs from sitemap ${sitemapUrl}, ${error.message}`);
        return [];
    }
}

// Main func
(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        bypassCSP: true, // ignoring Content Security Policy
        ignoreHTTPSErrors: true, // ignoring errors HTTPS
        // turning off caches
        permissions: ['notifications'], // permissions for sendind notifications for some pages (if needed)
        viewport: { width: 1280, height: 1024 } // browser`s window size
    });
    const page = await context.newPage();

    // turning off caches
    await page.route('**/*', (route) => {
        route.continue({ headers: { ...route.request().headers(), 'Cache-Control': 'no-cache' } });
    });

    // sitemap URL
    const sitemapURL = 'https://frozzy.hsdevops.net/sitemap.xml'; // URL with sitemap

    // Racieving list of pages from sitemap
    const urls = await getSitemapURLs(sitemapURL);

    // listening network requests on page
    page.on('request', (request) => {
        const requestUrl = request.url();

        // Logging every request
        console.log(`Loading: ${requestUrl}`);

        // Checking for matches arguments in URL`s
        searchArgs.forEach(arg => {
            if (requestUrl.includes(arg)) {
                console.log(`MATCHES FOUND: ${requestUrl} has ${arg}!`);
            }
        });
    });

    // Checking every page from sitemap
    for (const url of urls) {
        console.log(`Opening page: ${url}`);

        try {
            await page.goto(url, { waitUntil: "networkidle" }); // waiting untill requests ends
            console.log(`Page loaded successfully: ${url}`);

            // adding timeout for waiting all downloads
            await page.waitForTimeout(5000); // 5 waiting

        } catch (error) {
            console.error(`ERROR during loading: ${url}, ${error.message}`);
        }
    }

    await browser.close();
})();