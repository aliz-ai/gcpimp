
function parseMetric(metricString) {
	return parseFloat(metricString.trim().split(' ')[0], 10)
}

val metrics = $$('dax-service-metrics div.p6n-kv-list-value span span');

val currentCPU = parseMetric(metrics[0].innerText)
val totalCPU = parseMetric(metrics[1].innerText)

val currentMemory = parseMetric(metrics[2].innerText)
val totalMemory = parseMetric(metrics[3].innerText)

val currentPD = parseMetric(metrics[4].innerText)
val totalPD = parseMetric(metrics[5].innerText)

val currentSSD = parseMetric(metrics[6].innerText)
val totalSSD = parseMetric(metrics[7].innerText)



