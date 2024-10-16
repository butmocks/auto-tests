#!/bin/bash

# Run the Node.js script and redirect output to a log file
node /home/cms/auto-tests/content-loader-playwright/clientSitemapChecker.js > /home/cms/auto-tests/content-loader-playwright/client-logfile.log 2>&1

# Add subject to the email
echo "Subject: Playwright CLIENT sitemap Auto Tester  (CLIENT content pages aviability)" > /tmp/email.txt

# Append the content of the log file to the email body
echo -e "\n\n" >> /tmp/email.txt
cat /home/cms/auto-tests/content-loader-playwright/client-logfile.log >> /tmp/email.txt

# Send email using msmtp
msmtp -a default debug@logger.hostiserver.com < /tmp/email.txt

# Remove temporary email file
rm /tmp/email.txt
