// document.getElementsByTagName("header")[0].style.background = "lightblue";

const createLinkToHereAnchor = () => {
	const anchor = document.createElement('a');
	const linkText = document.createTextNode('Link to here');
	anchor.appendChild(linkText);
	anchor.title = 'copy';
	anchor.style.marginLeft = '10px';
	anchor.classList.add('gcpimp-linktohere');
	return anchor;
};

document.addEventListener('click', () => {
	const elements = Array.from(document.querySelectorAll('.p6n-logs-json-key'));
	if (elements.length === 0) {
		return;
	}

	const requestIdNodes = elements.filter(el => (el as HTMLElement).innerText === 'requestId: ');
	for (const requestIdNode of requestIdNodes) {
		const requestIdParentNode = requestIdNode.parentElement as HTMLElement;

		if (requestIdParentNode.querySelector('a.gcpimp-linktohere')) {
			continue;
		}

		const linkToHereAnchor = createLinkToHereAnchor();
		requestIdParentNode.appendChild(linkToHereAnchor);

		let requestIdValue = (requestIdParentNode
			.querySelector('.p6n-logs-json-value') as HTMLElement)
			.innerText;
		requestIdValue = requestIdValue.substring(1, requestIdValue.length - 1);

		let url = window.location.href;
		url = updateQueryStringParameter(url, 'filters', 'protoPayload.requestId:' + requestIdValue);

		let endTime = (Array
			.from(requestIdParentNode
			.parentElement
			.parentElement
			.querySelectorAll('.p6n-logs-json-key') as NodeListOf<HTMLElement>)
			.find(e => e.innerText === 'endTime')
			.parentElement
			.querySelector('.p6n-logs-json-value') as HTMLElement)
			.innerText;
		endTime = endTime.substring(1, endTime.length - 2);
		endTime += '000Z';

		url = updateQueryStringParameter(url, 'timestamp', endTime);

		linkToHereAnchor.href = url;
	}
});

function getLogElementsByName(elements: HTMLElement[], name): HTMLElement[] {
	return elements.filter(e => e.innerText === name);
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
