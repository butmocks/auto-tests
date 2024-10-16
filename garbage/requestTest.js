
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
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // const sitemapUrl = "https://devil.hsdevops.net/community/articles/how-chrome-68-release-affects-http-website";
  // const sitemapUrl = 'https://hostiserver.com/sitemap';
  // const sitemapUrl = 'http://193.84.17.52/content-loader/second-page';
  const sitemapUrl = 'https://test.hsdevops.net/sitemap.xml';
  // console.error(`Opening page: ${sitemapUrl}`);
  console.log(`Opening page: ${sitemapUrl}`);
  // console.info(`Opening page: ${sitemapUrl}`);
  try {
    const { data } = await axios.get(sitemapUrl);
    const sitemapXml = data;
    const urls = await parseSitemap(sitemapXml);
    // Prepare the filename with the current date
    // const currentDate = new Date().toISOString().slice(0, 10); const
    // filename = `site-checker_${currentDate}.txt`;
    const filename = `site-checker.txt`;
    // Create a write stream to log the output to a file
    const writeStream = fs.createWriteStream(path.join(__dirname, filename));
    // Log the output to the console and the file
    writeStream.write(`Links from the sitemap:\n${urls.join("\n")}\n\n`);
    console.log(`Links from the sitemap:\n${urls.join("\n")}\n`);
    for (const url of urls) {
      console.log(`Opening page: ${url}`);
      try {
        await page.goto(url, { waitUntil: "load" });
        console.log(`Loading complete for: ${url}\n`);
        // Log the success message to the file
        writeStream.write(`Loading complete for: ${url}\n`);
      } catch (err) {
        console.error(`err opening URL: ${url}, ${err.message}\n`);
        // Log the err message to the file
        writeStream.write(`err opening URL: ${url}, ${err.message}\n`);
      }
    }
    // Close the write stream
    writeStream.end();
    console.log(`Results logged 
        to: ${filename}`);
  } catch (err) {
    console.error(`error requesting URL: ${sitemapUrl}, ${err.message}`);
  }
  await browser.close();
})();
