import './old/auth';

const scriptsForUrls = Object.freeze<{ urls: string[], file: string }[]>([
	{ urls: ['https://console.cloud.google.com/dataflow/job/'], file: 'dataflow_price_content_script.js' },
	{ urls: ['https://console.cloud.google.com/', 'merkur-production'], file: 'prod-color.js' },
	{ urls: ['https://console.cloud.google.com/logs/viewer'], file: 'appengine_log_script.js' },
	{ urls: ['https://console.cloud.google.com/storage/browser'], file: 'storage_preview_script.js' },
	{ urls: ['https://bigquery.cloud.google.com/dataset'], file: 'bigquery_statistics.js' },
]);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status !== 'complete') {
		return;
	}
	scriptsForUrls
		.filter(script => script.urls
			.every(url => tab.url.includes(url)))
		.forEach(script => {
			chrome.tabs.executeScript(tabId, { file: 'vendor.js' });
			chrome.tabs.executeScript(tabId, { file: script.file });
		});
});
