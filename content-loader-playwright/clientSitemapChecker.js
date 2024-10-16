const { chromium } = require('playwright');
const axios = require("axios");
const { parseString } = require("xml2js");


function parseSitemap(xml) {
    return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const urls = result.urlset.url.map((url) => url.loc[0]);
                    resolve(urls);
                } catch (e) {
                    reject(e);
                }
            }
        });
    });
}

// Фильтрация URL из sitemap
function filterSitemapURLs(urls) {
    return urls.filter(url => url.includes('/sitemap') || url.endsWith('.xml'));
}

(async () => {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // URL для страницы логина
    const loginUrl = 'https://www.hostiserver.com/login';

    // Данные для логина
    const login = 'frozzy-user';
    const password = 'Xot567t01';

    // Логин на сайте
    await page.goto(loginUrl, { waitUntil: 'networkidle' });
    await page.fill('#login', login);
    await page.fill('#password', password);
    // await page.click('button');

    await page.click('.sign-up__field .bttn_04');

    // Ожидание завершения навигации после логина
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Сохранение cookies после логина
    const cookies = await context.cookies();

    // Создание нового контекста с авторизационными cookies
    const authContext = await browser.newContext({ cookies });
    const authPage = await authContext.newPage();

    // Установка обработчика ошибок на странице
    page.on("response", (response) => {
        if (!response.ok()) {
            console.error(`ERROR during checking: ${response.url()} , status (${response.status()})`);
        }
    });

    // Список URL, это может быть простой URL или sitemap.xml для получения URL
    const URLs = [
        //'http://162.251.109.80/sitemap.xml'
        //'http://test.hsdevops.net/client/sitemap.xml',
        'https://hostiserver.com/client/sitemap.xml',

        // 'http://193.84.17.52/content-loader/sitemap.xml', // это для тестов
        // 'https://devil.hsdevops.net/community/articles/how-chrome-68-release-affects-http-website', // это для тестов
        // 'https://test.hsdevops.net/sitemap/', // это для тестов
        // 'http://193.84.17.52/content-loader/second-page', // это для тестов
        // 'https://devil.hsdevops.net/client'
    ];

    // Фильтрация URL на sitemaps
    const sitemapURLs = filterSitemapURLs(URLs);

    // Проверка URL
    for (const url of sitemapURLs) {
        console.log(`Opening page: ${url}`);
        try {
            // Если URL - это sitemap, мы получаем URL из sitemap
            if (url.includes('/sitemap') || url.endsWith('.xml')) {
                const { data } = await axios.get(url, {
                    headers: {
                        'Cookie': cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
                    }
                });
                const sitemapXml = data;
                const urls = await parseSitemap(sitemapXml).catch(err => {
                    console.error(`Error parsing XML from ${url}: ${err.message}`);
                    return [];
                });
                // Проверка URL из sitemap
                for (const sitemapUrl of urls) {
                    console.log(`Opening page from sitemap: ${sitemapUrl}`);
                    try {
                        await authPage.goto(sitemapUrl, { waitUntil: "load" });
                        console.log(`Download is OK: ${sitemapUrl}\n`);
                    } catch (error) {
                        console.error(`ERROR due opening URL from sitemap: ${sitemapUrl}, ${error.message}\n`);
                    }
                }
            } else { // если URL не является sitemap
                await authPage.goto(url, { waitUntil: "load" });
                console.log(`Download is OK: ${url}\n`);
            }
        } catch (error) {
            console.error(`ERROR while opening URL: ${url}, ${error.message}\n`);
        }
    }

    await browser.close();
})();
