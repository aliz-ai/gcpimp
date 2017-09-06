function getAuthToken(resolve: (x: string) => void) {
	chrome.runtime.sendMessage({ subject: 'authToken' }, response => {
		console.log('Response: ' + response);
		if (!response) {
			console.log(chrome.runtime.lastError);
		} else {
			console.log('Token aquired: ' + response.authToken);
			return resolve(response.authToken);
		}
	});
}

chrome.runtime.sendMessage({ subject: 'authToken' }, response => {
	if (response === undefined) {
		console.error(chrome.runtime.lastError);
	} else {

		console.log('Dataset.......... ');
		const url = document.location.href;

		const projectAndDataset = url.substr(url.lastIndexOf('/') + 1).split(':');

		const xhr = new XMLHttpRequest();
		const projectId = projectAndDataset[0];
		const datasetId = projectAndDataset[1];

		console.log('Project: ' + projectId);
		console.log('Dataset: ' + datasetId);

		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				console.log(xhr.responseText);
				const newRow = document.querySelectorAll('.dataset-view tbody tr')[1].cloneNode(true);
				newRow.querySelectorAll('td')[0].innerHTML = 'Data size';
				newRow.querySelectorAll('td')[1].innerHTML = parseFloat(JSON.parse(xhr.responseText).rows[0].f[0].v, 10) / 1024 / 1024 / 1024 + ' GB';
				document.querySelector('.dataset-view tbody').appendChild(newRow);

			}
		};
		xhr.open('POST', 'https://www.googleapis.com/bigquery/v2/projects/' + projectId + '/queries', true);
		xhr.setRequestHeader('Authorization', 'Bearer ' + response.authToken);
		xhr.setRequestHeader('content-type', 'application/json');

		xhr.send(JSON.stringify({
			query: 'select sum(size_bytes) as size from [' + projectId + ':' + datasetId + '.__TABLES__]',
			kind: 'bigquery#queryRequest',
			useLegacySql: true,
		}));

	}
});
