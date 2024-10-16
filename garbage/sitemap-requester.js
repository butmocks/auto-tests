`use strict`;
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const axios = require("axios");
const { parseString } = require("xml2js");

// Function to extract links from XML string
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

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' }); // Run Puppeteer in headless mode
  const page = await browser.newPage();
  const sitemapUrl = 'https://test.hsdevops.net/sitemap.xml';
  //   const sitemapUrl = "https://hostiserver.com/sitemap";
  console.log(`Opening page: ${sitemapUrl}`);

  try {
    const { data } = await axios.get(sitemapUrl);
    const sitemapXml = data;
    const urls = await parseSitemap(sitemapXml);

    const filename = `site-checker.txt`;
    const writeStream = fs.createWriteStream(path.join(__dirname, filename));

    writeStream.write(`Links from the sitemap:\n${urls.join("\n")}\n\n`);
    console.log(`Links from the sitemap:\n${urls.join("\n")}\n`);

    page.on("requestfailed", (request) => {
      console.error(`Request failed: ${request.url()}`);
      writeStream.write(`Request failed: ${request.url()}\n`);
    });

    // // Intercept requests to check status
    // // page.setRequestInterception(true);
    // page.on("request", async (request) => {
    //   try {
    //     const response = await request.continue();
    //     if (!response || response.status() !== 200) {
    //       console.error(`Request failed: ${request.url()}`);
    //       writeStream.write(`Request failed: ${request.url()}\n`);
    //     }
    //   } catch (err) {
    //     console.error(`Error handling request: ${err}`);
    //   }
    // });

    for (const url of urls) {
      console.log(`Opening page: ${url}`);
      try {
        await page.goto(url, { waitUntil: 'load' });
        console.log(`Loading complete for: ${url}\n`);
        writeStream.write(`Loading complete for: ${url}\n`);
      } catch (err) {
        console.error(`err opening URL: ${url}, ${err.message}\n`);

        console.log(`Error opening URL: ${url}, ${err.message}\n`);
        writeStream.write(`Error opening URL: ${url}, ${err.message}\n`);
      }
    }

    writeStream.end();
    console.log(`Results logged to: ${filename}`);
  } catch (err) {
    console.log(`Error requesting URL: ${sitemapUrl}, ${err.message}`);
    console.error(`error requesting URL: ${sitemapUrl}, ${err.message}`);
  }

  await browser.close();
})();
