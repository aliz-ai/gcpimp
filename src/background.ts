chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.search('https://console.cloud.google.com/dataflow/job/') >= 0) {
        chrome.tabs.executeScript(null, { file: "dataflow_price_content_script.js" });
    }
});