### English Documentation

#### Bash Script (`content-status-requester.sh`)
The bash script is executed on a cron schedule with the following command: `0 3 * * * /home/cms/auto-tests/scripts/content-status-requester.sh`.

This script performs the following steps:
1. Runs the Node.js script (`sitemapChecker.js`).
2. Redirects the output to a log file.
3. Creates a temporary email file with the subject "Auto Tester (content pages aviability)".
4. Appends the content of the log file to the email body.
5. Sends the email using `msmtp`.
6. Removes the temporary email file.

#### Node.js Script (`sitemapChecker.js`)
The `sitemapChecker.js` script is responsible for checking the availability of content pages listed in the provided URLs, including sitemap.xml files.

It performs the following actions:
1. Parses URLs from XML strings using the `parseSitemap` function.
2. Filters URLs from sitemaps using the `filterSitemapURLs` function.
3. Launches a Puppeteer browser instance.
4. Navigates to each URL and checks if the content loads successfully.
5. Logs any errors encountered during the process.

### Ukrainian Documentation

#### Bash Скрипт (`content-status-requester.sh`)
Баш-скрипт виконується за розкладом крону за допомогою такої команди: `0 3 * * * /home/cms/auto-tests/scripts/content-status-requester.sh`.

Цей скрипт виконує наступні кроки:
1. Запускає скрипт Node.js (`sitemapChecker.js`).
2. Перенаправляє вивід до файлу журналу.
3. Створює тимчасовий файл електронної пошти з темою "Auto Tester (доступність сторінок контенту)".
4. Додає вміст файлу журналу до тіла електронного листа.
5. Відправляє електронний лист за допомогою `msmtp`.
6. Видаляє тимчасовий файл електронної пошти.

#### Скрипт Node.js (`sitemapChecker.js`)
Скрипт `sitemapChecker.js` відповідає за перевірку доступності сторінок контенту, перерахованих у вказаних URL-адресах, включаючи файли sitemap.xml.

Він виконує наступні дії:
1. Розбирає URL-адреси з XML-рядків за допомогою функції `parseSitemap`.
2. Фільтрує URL-адреси з мап сайту за допомогою функції `filterSitemapURLs`.
3. Запускає екземпляр браузера Puppeteer.
4. Переходить на кожен URL та перевіряє, чи завантажується контент успішно.
5. Реєструє будь-які помилки, що виникли під час процесу.