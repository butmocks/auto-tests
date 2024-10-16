const puppeteer = require("puppeteer");
const axios = require("axios");
const { parseString } = require("xml2js");

// Function for taking URLs from XML string
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

// Filtering urls from sitemap
function filterSitemapURLs(urls) {
    return urls.filter(url => url.includes('/sitemap') || url.endsWith('.xml'));
}

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // set errors to console
    page.on("response", (response) => {
        if (!response.ok()) {
            console.error(
                `ERROR during checking: ${response.url()} , status (${response.status()})`
            );
        }
    });

    // List of URL`s, it could be simple URL, or sitemap.xml for taking URLs
    const URLs = [
        // 'https://hostiserver.com/sitemap.xml', // URL WITH SITEMAP 
        // 'https://frozzy.hsdevops.net/sitemap.xml'
        'https://test.hsdevops.net/sitemap.xml'
        // 'https://devil.hsdevops.net/sitemap.xml',
        //    'http://193.84.17.52/content-loader/sitemap.xml', // this is for TESTs
        //    'https://devil.hsdevops.net/community/articles/how-chrome-68-release-affects-http-website', // this is for TESTs
        //    'https://test.hsdevops.net/sitemap/', // this is for TESTs
        //    'http://193.84.17.52/content-loader/second-page' // this is for TESTs
    ];

    // filtering urls on sitemaps
    const sitemapURLs = filterSitemapURLs(URLs);

    // check URL`s
    for (const url of sitemapURLs) {
        console.log(`Opening page: ${url}`);
        try {
            // if URL - is sitemap, we`ll taking urls from sitemap
            if (url.includes('/sitemap') || url.endsWith('.xml')) {
                const { data } = await axios.get(url);
                const sitemapXml = data;
                const urls = await parseSitemap(sitemapXml);
                // checkingURLs from sitemap
                for (const sitemapUrl of urls) {
                    console.log(`Opening page from sitemap: ${sitemapUrl}`);
                    try {
                        await page.goto(sitemapUrl, { waitUntil: "load" });
                        console.log(`Download is OK: ${sitemapUrl}\n`);
                    } catch (error) {
                        console.error(`ERROR due opening URL from sitemap: ${sitemapUrl}, ${error.message}\n`);
                    }
                }
            } else { // if URL is nor erl for sitemap
                await page.goto(url, { waitUntil: "load" });
                console.log(`Download is OK: ${url}\n`);
            }
        } catch (error) {
            console.error(`ERROR while opening URL: ${url}, ${error.message}\n`);
        }
    }

    await browser.close();
})();
