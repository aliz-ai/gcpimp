export async function enrichBigQueryStatistics() {
	const authResponse = await new Promise<any>(resolve => chrome.runtime.sendMessage({ subject: 'authToken' }, resolve));
	if (!authResponse) {
		return;
	}

	console.log('Dataset.......... ');
	const url = document.location.href;

	const [projectId, datasetId] = url.substr(url.lastIndexOf('/') + 1).split(':');
	console.log('Project: ' + projectId);
	console.log('Dataset: ' + datasetId);

	const sizeQueryUrl = 'https://www.googleapis.com/bigquery/v2/projects/' + projectId + '/queries';
	const sizeQueryResponse = await fetch(sizeQueryUrl, {
		method: 'POST',
		headers: new Headers({
			'Authorization': 'Bearer ' + authResponse.authToken,
			'content-type': 'application/json',
		}),
		body: JSON.stringify({
			query: 'select sum(size_bytes) as size from [' + projectId + ':' + datasetId + '.__TABLES__]',
			kind: 'bigquery#queryRequest',
			useLegacySql: true,
		}),
	});

	const responseBody = await sizeQueryResponse.json();
	console.log(responseBody);
	const newRow = document.querySelectorAll('.dataset-view tbody tr')[1].cloneNode(true) as Element;
	const [infoTableKey, infoTableValue] = newRow.querySelectorAll('td');
	infoTableKey.innerHTML = 'Data size';
	infoTableValue.innerHTML = parseFloat(responseBody.rows[0].f[0].v) / 1024 / 1024 / 1024 + ' GB';
	document.querySelector('.dataset-view tbody').appendChild(newRow);
}

enrichBigQueryStatistics();
