#!/bin/bash

#  Check if at least one search argument is provided
if [ $# -lt 1 ]; then
    echo "ERROR: You need to provide at least one search term."
    exit 1
fi

# Run the Node.js script and pass the search terms to it
node /home/cms/auto-tests/content-loader-playwright/contentSearcher.js "$@" > /home/cms/auto-tests/content-loader-playwright/searcher_log.log 2>&1

# Check if searcher_log.log has errors
if grep -q "ERROR" /home/cms/auto-tests/content-loader-playwright/searcher_log.log; then
    # If theres errors, send them
    echo "Subject: [searcher/sitemap/HS0053(HOSTISERVER.COM)] Errors during execution" > /tmp/email.txt
    echo -e "There are ERRORS during the script execution. See the attached logs.\n\n" >> /tmp/email.txt

    # Attaching logs
    cat /home/cms/auto-tests/content-loader-playwright/searcher_log.log >> /tmp/email.txt
    echo -e "\n\n---\n" >> /tmp/email.txt
    cat /home/cms/auto-tests/content-loader-playwright/matched_results.log >> /tmp/email.txt

    # Sending mail with logs
    msmtp -a default debug@logger.hostiserver.com < /tmp/email.txt
else
    # Checking if matched_results.log is empty
    if [ ! -s /home/cms/auto-tests/content-loader-playwright/matched_results.log ]; then
        # In case of its empty send message about it
        echo "Subject: [searcher/sitemap/HS0053(HOSTISERVER.COM)] No matches found" > /tmp/email.txt
        echo -e "During checking specific requests, no matches were found." >> /tmp/email.txt
    else
        # In case of finded results - sending results
        echo "Subject: [searcher/sitemap/HS0053(HOSTISERVER.COM)] Matches found" > /tmp/email.txt
        echo -e "Here are some results for your search:\n\n" >> /tmp/email.txt
        cat /home/cms/auto-tests/content-loader-playwright/matched_results.log >> /tmp/email.txt
    fi

    # sending mail
    msmtp -a default debug@logger.hostiserver.com < /tmp/email.txt
fi

# removing mail with temp file
rm /tmp/email.txt
