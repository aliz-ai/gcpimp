import { AuthToken } from './auth';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        if (tab.url.search('https://console.cloud.google.com/dataflow/job/') >= 0) {
            chrome.tabs.executeScript(tabId, { file: "dataflow_price_content_script.js" });
        }
        if (tab.url.search('https://console.cloud.google.com/') >= 0 && tab.url.search('merkur-production') >= 0) {
            chrome.tabs.executeScript(tabId, { file: "prod-color.js" });
            // chrome.tabs.insertCSS(tabId, { file: "prod-color.css" });
        }
        if (tab.url.search('https://console.cloud.google.com/logs/viewer') >= 0) {
            chrome.tabs.executeScript(tabId, { file: 'appengine_log_script.js' });
        }
        if (tab.url.search('https://console.cloud.google.com/storage/browser') >= 0) {
            chrome.tabs.executeScript(tabId, { file: 'storage_preview_script.js' });
        }
        if (tab.url.search('https://bigquery.cloud.google.com/dataset') >= 0) {
            chrome.tabs.executeScript(tabId, { file: 'bigquery_statistics.js' });
        }
    }
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.subject === "authToken") {
            new AuthToken().getAuthToken().then(token => {
                sendResponse({ authToken: token });
            });
            return true;
        }
    });
