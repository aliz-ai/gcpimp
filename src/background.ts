chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
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
});

class AuthToken {

    getAuthToken(): Promise<string> {
        return new Promise<string>((resolve: (string) => void, reject: (any) => void) => {
            chrome.identity.getAuthToken({
                interactive: true,
                scopes: ['https://www.googleapis.com/auth/bigquery', 'https://www.googleapis.com/auth/devstorage.full_control']
            }, token => {
                if (token === undefined) {
                    reject("Error while getting token!");
                } else {
                    resolve(token);
                }
            });
        });
    }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request);
    console.log(sender);
    if(request.subject === "authToken") {
      console.log("Authenticating")
      new AuthToken().getAuthToken().then(token => {
        console.log("Token: " + token);
        sendResponse({authToken: token});
      } ).catch(console.log);
      return true;
    } else {
      console.log("Unhandled message: " + request)
    }
  });
