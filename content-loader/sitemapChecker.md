### English Documentation

#### Sitemap Checker Script

**Overview:**
The Sitemap Checker script is designed to validate the links present in a sitemap file. It utilizes Puppeteer for browser automation and Axios for HTTP requests to retrieve the sitemap XML. The script then parses the XML to extract URLs and checks each URL for content availability.

**Actions:**

1. The script starts by launching a Puppeteer browser instance.
2. It retrieves the sitemap XML using Axios HTTP request.
3. The XML is parsed to extract URLs using the `parseSitemap` function.
4. URLs are filtered to include only those related to sitemaps using the `filterSitemapURLs` function.
5. For each URL, the script navigates to the page using Puppeteer's `page.goto` method.
6. If the URL corresponds to a sitemap, it extracts URLs from the sitemap and checks their availability recursively.
7. The script logs the status of each URL, indicating whether the page was successfully loaded or encountered an error.

**Expected Behavior:**

- For sitemap URLs, the script extracts URLs from the sitemap and recursively checks their availability.
- For regular URLs, the script directly checks the availability of the content.
- It logs any errors encountered during the process.

**Content Checked:**
The script checks the availability of web content corresponding to the URLs listed in the sitemap. This includes web pages, documents, or any other resources linked in the sitemap.

**Requirements:**

- Node.js installed
- Puppeteer library (`npm install puppeteer`)
- Axios library (`npm install axios`)
- xml2js library (`npm install xml2js`)

**Usage:**

1. Install the required dependencies by running:

   ```bash
   npm install puppeteer axios xml2js
   ```

2. Run the script using Node.js:

   ```bash
   node sitemapChecker.js
   ```

**Output:**

- The script logs the status of each URL to the console.
- For each URL in the sitemap, it indicates whether the page was successfully loaded or encountered an error.

**Troubleshooting:**

- If encountering any issues, refer to the troubleshooting section in Puppeteer's documentation: [Puppeteer Troubleshooting](https://pptr.dev/troubleshooting).

---

### Українська Документація

#### Скрипт Перевірки Sitemap

**Огляд:**
Скрипт Перевірки Sitemap призначений для перевірки посилань, які містяться у файлі sitemap. Він використовує Puppeteer для автоматизації браузера та Axios для HTTP-запитів для отримання XML-файлу sitemap. Потім скрипт розбирає XML для вилучення URL-адрес та перевіряє кожен URL на доступність контенту.

**Дії:**

1. Скрипт починається з запуску екземпляру браузера Puppeteer.
2. Він отримує XML-файл sitemap за допомогою HTTP-запиту Axios.
3. XML розбирається для вилучення URL-адрес за допомогою функції `parseSitemap`.
4. URL-адреси фільтруються, щоб включати лише ті, що стосуються sitemap, за допомогою функції `filterSitemapURLs`.
5. Для кожного URL скрипт переходить на сторінку за допомогою методу `page.goto` Puppeteer.
6. Якщо URL відповідає sitemap, він вилучає URL-адреси з sitemap та рекурсивно перевіряє їх доступність.
7. Скрипт реєструє статус кожного URL, показуючи, чи сторінка успішно завантажується чи виникає помилка.

**Очікувана Поведінка:**

- Для URL-адрес sitemap скрипт вилучає URL-адреси з

 sitemap та рекурсивно перевіряє їх доступність.

- Для звичайних URL-адрес сторінки скрипт безпосередньо перевіряє доступність контенту.
- Він реєструє будь-які помилки, виявлені під час процесу.

**Перевіряється Контент:**
Скрипт перевіряє доступність веб-контенту, що відповідає URL-адресам, перерахованим у sitemap. Це включає веб-сторінки, документи або будь-які інші ресурси, посилані в sitemap.

**Вимоги:**

- Встановлений Node.js
- Бібліотека Puppeteer (`npm install puppeteer`)
- Бібліотека Axios (`npm install axios`)
- Бібліотека xml2js (`npm install xml2js`)

**Використання:**

1. Встановіть необхідні залежності, виконавши:

   ```bash
   npm install puppeteer axios xml2js
   ```

2. Запустіть скрипт за допомогою Node.js:

   ```bash
   node sitemapChecker.js
   ```

**Вивід:**

- Скрипт реєструє статус кожного URL у консолі.
- Для кожного URL у sitemap він показує, чи сторінка успішно завантажується чи виникає помилка.

**Усунення Несправностей:**

- У разі виникнення проблем див. розділ усунення несправностей у документації Puppeteer: [Puppeteer Усунення Несправностей](https://pptr.dev/troubleshooting).
