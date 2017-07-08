//document.getElementsByTagName("header")[0].style.background = "lightblue";

document.addEventListener("click", function () {
	var elements = document.getElementsByClassName("p6n-logs-json-key");
	if (elements.length == 0) {
		return;
	}

	var requestIdNodes = getLogElementsByName(elements, "requestId: ");
	for (let i = 0; i < requestIdNodes.length; i++) {
		var requestIdNode = requestIdNodes[i];
		var requestIdParentNode = requestIdNode.parentNode;

		if (requestIdParentNode.getElementsByTagName("a").length != 0) {
			continue;
		}

		var a = document.createElement('a');
		var linkText = document.createTextNode("Link to here");
		a.appendChild(linkText);
		a.title = "copy";
		a.style.marginLeft = "10px";
		requestIdParentNode.appendChild(a);

		var requestIdValue = requestIdParentNode.getElementsByClassName("p6n-logs-json-value")[0].innerText;
		requestIdValue = requestIdValue.substring(1, requestIdValue.length - 1);

		var url = window.location.href;
		url = updateQueryStringParameter(url, "filters", "protoPayload.requestId:" + requestIdValue);

		var endTime = getLogElementsByName(requestIdParentNode.parentNode.parentNode.getElementsByClassName("p6n-logs-json-key"), "endTime: ")[0].parentNode.getElementsByClassName("p6n-logs-json-value")[0].innerText;
		endTime = endTime.substring(1, endTime.length - 2);
		endTime += "000Z";

		url = updateQueryStringParameter(url, "timestamp", endTime);

		a.href = url;
	}
});

function getLogElementsByName(elements, name) {
	return Array.prototype.filter.call(elements, function (testElement) {
		return testElement.innerText === name;
	});
}


function updateQueryStringParameter(uri, key, value) {
	var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
	var separator = uri.indexOf('?') !== -1 ? "&" : "?";
	if (uri.match(re)) {
		return uri.replace(re, '$1' + key + "=" + value + '$2');
	}
	else {
		return uri + separator + key + "=" + value;
	}
}

