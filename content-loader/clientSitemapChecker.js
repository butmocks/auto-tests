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
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    //===================================================================================
    // URL для страницы логина
    const loginUrl = 'https://frozzy.hsdevops.net/login';

    // Данные для логина
    const login = 'frozzy-user';
    const password = 'Xot567t01';

    // Логин на сайте
    await page.goto(loginUrl, { waitUntil: 'networkidle2' });
    await page.type('#login', login);
    await page.type('#password', password);
    await page.click('button');
    //await page.locator('button').click();
    // Ожидание завершения навигации после логина
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Сохранение cookies после логина
    const cookies = await page.cookies();
    //===================================================================================
    // Установка обработчика ошибок на странице
    page.on("response", (response) => {
        if (!response.ok()) {
            console.error(`ERROR during checking: ${response.url()} , status (${response.status()})`);
        }
    });

    // Список URL`ов, это может быть простой URL или sitemap.xml для получения URL`ов
    const URLs = [
        'https://hostiserver.com/sitemap.xml', // URL с sitemap
        //'https://test.hsdevops.net/client/sitemap.xml'
        // 'https://devil.hsdevops.net/sitemap.xml',
        //    'http://193.84.17.52/content-loader/sitemap.xml', // это для тестов
        //    'https://devil.hsdevops.net/community/articles/how-chrome-68-release-affects-http-website', // это для тестов
        //    'https://test.hsdevops.net/sitemap/', // это для тестов
        //    'http://193.84.17.52/content-loader/second-page' // это для тестов
    ];

    // Фильтрация URL на sitemaps
    const sitemapURLs = filterSitemapURLs(URLs);

    // Проверка URL
    for (const url of sitemapURLs) {
        console.log(`Opening page: ${url}`);
        try {
            // Если URL - это sitemap, мы получаем URL'ы из sitemap
            if (url.includes('/sitemap') || url.endsWith('.xml')) {
                const { data } = await axios.get(url);
                const sitemapXml = data;
                const urls = await parseSitemap(sitemapXml);
                // Проверка URL'ов из sitemap
                for (const sitemapUrl of urls) {
                    console.log(`Opening page from sitemap: ${sitemapUrl}`);
                    try {
                        await page.setCookie(...cookies); // Установка cookies
                        await page.goto(sitemapUrl, { waitUntil: "load" });
                        console.log(`Download is OK: ${sitemapUrl}\n`);
                    } catch (error) {
                        console.error(`ERROR due opening URL from sitemap: ${sitemapUrl}, ${error.message}\n`);
                    }
                }
            } else { // если URL не является sitemap
                await page.setCookie(...cookies); // Установка cookies
                await page.goto(url, { waitUntil: "load" });
                console.log(`Download is OK: ${url}\n`);
            }
        } catch (error) {
            console.error(`ERROR while opening URL: ${url}, ${error.message}\n`);
        }
    }

    await browser.close();
})();
