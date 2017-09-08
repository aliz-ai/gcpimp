class Page {
	public storageObjectsTable = () => document.querySelector('#p6n-storage-objects-table');
	public storageObjectsTableRows = () => Array.from(document.querySelectorAll('#p6n-storage-objects-table > tbody > tr'));
	public storageObjectsTableRowMenuCell = (row: Element) => row.querySelector('td:nth-child(8)');
	public storageObjectsTableRowFileName = (row: Element) => row.querySelector('td:nth-child(2) pre').innerHTML.trim();
	public storageObjectsTableRowPreviewButton = (row: Element) => row.querySelector('td:nth-child(8) button');
}
const page = new Page();

function observeDOM(callback: () => void): void {
	// create an observer instance
	const observer: MutationObserver = new MutationObserver(mutations => callback());

	// configuration of the observer:
	const config = {
		childList: true,
		characterData: true,
		subtree: true,
	};

	// pass in the target node, as well as the observer options
	observer.observe(page.storageObjectsTable(), config);
}

const showFilePreviewOnClick = fileName => () =>
	chrome.runtime.sendMessage({ subject: 'authToken' }, response => {
		if (!response) {
			console.error(chrome.runtime.lastError);
		} else {
			const [_, bucket, path] = window.location.href.match('https://console.cloud.google.com/storage/browser/([^/]+)/([^?]*)');
			const fileUrl = 'https://www.googleapis.com/storage/v1/b/' + bucket + '/o/' + path + fileName;
			const baseHeaders = { Authorization: 'Bearer ' + response.authToken };
			fetch(fileUrl, { headers: new Headers(baseHeaders) })
				.then(res => res.json())
				.then(res => fetch(res.mediaLink, { headers: new Headers(Object.assign({ Range: 'bytes=0-5120' }, baseHeaders)) }))
				.then(contentResponse => console.log(contentResponse));
		}
	});

function createFilePreviewButton(menuCell: Element, fileName: string) {
	const previewButton = document.createElement('button');
	previewButton.innerHTML = ' Preview file ';
	previewButton.addEventListener('click', showFilePreviewOnClick(fileName));
	menuCell.insertBefore(previewButton, menuCell.querySelector('pan-overflow-menu'));
}

function waitFor(isPresent: () => boolean, callback: () => void) {
	if (isPresent()) {
		callback();
		return;
	}
	let time = 0;
	const key = setInterval(function() {
		if (isPresent() || time > 10000) {
			clearInterval(key);
			if (isPresent()) {
				callback();
			}
			return;
		}
		time += 1000;
	}, 1000);
}

const update = () => page
	.storageObjectsTableRows()
	.filter(row => !!page.storageObjectsTableRowPreviewButton(row))
	.forEach(row => createFilePreviewButton(page.storageObjectsTableRowMenuCell(row), page.storageObjectsTableRowFileName(row)));

waitFor(() => !!page.storageObjectsTable(), () => {
	observeDOM(update);
	update();
});
