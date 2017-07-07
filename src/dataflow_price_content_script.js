function parseMetric(metricString) {
	return parseFloat(metricString.trim().split(' ')[0], 10)
}
var firstRowOfMetrics = document.querySelector('dax-service-metrics div.p6n-kv-list-item');
var metrics = document.querySelectorAll('dax-service-metrics div.p6n-kv-list-value span span');

console.log(metrics);

var currentCPU = parseMetric(metrics[0].innerHTML)
var totalCPU = parseMetric(metrics[1].innerHTML)

var currentMemory = parseMetric(metrics[2].innerHTML)
var totalMemory = parseMetric(metrics[3].innerHTML)

var currentPD = parseMetric(metrics[4].innerHTML)
var totalPD = parseMetric(metrics[5].innerHTML)

var currentSSD = parseMetric(metrics[6].innerHTML)
var totalSSD = parseMetric(metrics[7].innerHTML)

var currentCostRow = firstRowOfMetrics.cloneNode(true);
var totalCostRow = firstRowOfMetrics.cloneNode(true);

currentCostRow.querySelector("div > span:first-child").innerHTML = " Current cost per hour ";
currentCostRow.querySelector("span.p6n-help-tooltip-msg span").innerHTML = " The cost of running this Dataflow job for an hour. ";

firstRowOfMetrics.parentNode.addChild(currentCostRow);
