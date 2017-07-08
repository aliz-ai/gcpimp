function getAuthToken(resolve: (string) => void) {
    chrome.runtime.sendMessage({subject : "authToken"}, function(response) {
		console.log("Response: " + response);
		if(response === undefined) {
			console.log(chrome.runtime.lastError)
		} else {
    	    console.log("Token aquired: " + response.authToken);
            return resolve(response.authToken);
        }
	});
}

chrome.runtime.sendMessage({ subject: 'authToken' }, response => {
	if (response === undefined) {
		console.error(chrome.runtime.lastError);
	} else {

		console.log("Dataset.......... ")
		var url = document.location.href;

		var projectAndDataset = url.substr(url.lastIndexOf('/') + 1).split(':');

		var xhr = new XMLHttpRequest();
		var projectId = projectAndDataset[0];
		var datasetId = projectAndDataset[1];

		console.log("Project: " + projectId);
		console.log("Dataset: " + datasetId);

		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				console.log(xhr.responseText);
				var newRow = document.querySelectorAll(".dataset-view tbody tr")[1].cloneNode(true)
				newRow.querySelectorAll("td")[0].innerHTML = "Data size";
				newRow.querySelectorAll("td")[1].innerHTML = parseFloat(JSON.parse(xhr.responseText)['rows'][0]['f'][0]['v'], 10)/1024/1024/1024 + " GB";
				document.querySelector(".dataset-view tbody").appendChild(newRow);
				
			}
		}
		xhr.open("POST", 'https://www.googleapis.com/bigquery/v2/projects/' + projectId + '/queries', true);
		xhr.setRequestHeader('Authorization', 'Bearer ' + response.authToken);
		xhr.setRequestHeader('content-type', 'application/json');
		:

		xhr.send(JSON.stringify({
			"query": "select sum(size_bytes) as size from [" + projectId + ":" + datasetId + ".__TABLES__]",
			"kind": "bigquery#queryRequest",
			"useLegacySql": true
		}));


	}
	});

