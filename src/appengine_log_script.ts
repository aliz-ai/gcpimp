// document.getElementsByTagName("header")[0].style.background = "lightblue";

document.addEventListener('click', () => {
	const elements = document.getElementsByClassName('p6n-logs-json-key');
	if (elements.length === 0) {
		return;
	}

	const requestIdNodes = getLogElementsByName(elements, 'requestId: ');
	for (const requestIdNode of requestIdNodes) {
		const requestIdParentNode = requestIdNode.parentNode;

		if (requestIdParentNode.getElementsByTagName('a').length !== 0) {
			continue;
		}

		const anchor = document.createElement('a');
		const linkText = document.createTextNode('Link to here');
		anchor.appendChild(linkText);
		anchor.title = 'copy';
		anchor.style.marginLeft = '10px';
		requestIdParentNode.appendChild(anchor);

		let requestIdValue = requestIdParentNode.getElementsByClassName('p6n-logs-json-value')[0].innerText;
		requestIdValue = requestIdValue.substring(1, requestIdValue.length - 1);

		let url = window.location.href;
		url = updateQueryStringParameter(url, 'filters', 'protoPayload.requestId:' + requestIdValue);

		let endTime = getLogElementsByName(requestIdParentNode.parentNode.parentNode.getElementsByClassName('p6n-logs-json-key'), 'endTime: ')[0].parentNode.getElementsByClassName('p6n-logs-json-value')[0].innerText;
		endTime = endTime.substring(1, endTime.length - 2);
		endTime += '000Z';

		url = updateQueryStringParameter(url, 'timestamp', endTime);

		anchor.href = url;
	}
});

function getLogElementsByName(elements, name) {
	return Array.prototype.filter.call(elements, testElement => testElement.innerText === name);
}

function updateQueryStringParameter(uri, key, value) {
	const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
	const separator = uri.indexOf('?') !== -1 ? '&' : '?';
	if (uri.match(re)) {
		return uri.replace(re, '$1' + key + '=' + value + '$2');
	} else {
		return uri + separator + key + '=' + value;
	}
}
