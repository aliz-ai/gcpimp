function parseMetric(metricString) {
	console.log("Parsed: " + metricString.trim().split(' ')[0])
	return parseFloat(metricString.trim().split(' ')[0], 10)
}


var batchMode = 'Batch';
var streamingMode = 'Streaming';

var cpu = 'CPU'
var memory = 'Memory'
var pd = 'PD'
var ssd = 'SSD'

var prices = {};

prices[batchMode] = {};
prices[batchMode][cpu] = 0.059;
prices[batchMode][memory] = 0.004172;
prices[batchMode][pd] = 0.000054;
prices[batchMode][ssd] = 0.000298;

prices[streamingMode] = {};
prices[streamingMode][cpu] = 0.059
prices[streamingMode][memory] = 0.004172
prices[streamingMode][pd] = 0.000054
prices[streamingMode][ssd] = 0.000298

var enhancePanel = function () {
	var firstRowOfMetrics = document.querySelector('dax-service-metrics div.p6n-kv-list-item');
	var metrics = document.querySelectorAll('dax-service-metrics div.p6n-kv-list-value span span');

	console.log("alma")
	// this should be 8 or 9 by default, so we'll only add the properties once
	if (metrics.length <= 9) {
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

		var pipelineOptions = document.querySelectorAll(".p6n-vulcan-panel-content > div > div > div:nth-of-type(2) div.p6n-kv-list-key > span");
		var zone;
		for (let child of pipelineOptions) {
			if (child.innerHTML.trim() === 'zone') {
				zone = child.parentNode.parentNode.querySelector('dax-default-value span span').innerHTML.trim();
			}
		}

		var jobType = document.querySelectorAll('dax-job-section div.p6n-kv-list-values span span')[6].innerHTML.trim();

		console.log("JobType: " + jobType)

		var pricesForJobType = prices[jobType];

		console.log(cpu + " " + pricesForJobType[cpu])
		console.log(memory + " " + pricesForJobType[memory])
		console.log(pd + " " + pricesForJobType[pd])
		console.log(ssd + " " + pricesForJobType[ssd])

		var currentCost = currentCPU * pricesForJobType[cpu] + currentMemory * pricesForJobType[memory] + currentPD * pricesForJobType[pd] + currentSSD * pricesForJobType[ssd]
		var totalCost = totalCPU * pricesForJobType[cpu] + totalMemory * pricesForJobType[memory] + totalPD * pricesForJobType[pd] + totalSSD * pricesForJobType[ssd]

		currentCostRow.querySelector("div.p6n-kv-list-key > span:first-child").innerHTML = " Current cost ";
		currentCostRow.querySelector("div.p6n-kv-list-key > span:last-child").remove();
		currentCostRow.querySelector("dax-default-value span span").innerHTML = currentCost + " $/hr";

		totalCostRow.querySelector("div.p6n-kv-list-key > span:first-child").innerHTML = " Total cost ";
		totalCostRow.querySelector("div.p6n-kv-list-key > span:last-child").remove();
		totalCostRow.querySelector("dax-default-value span span").innerHTML = totalCost + " $";

		firstRowOfMetrics.parentNode.appendChild(currentCostRow);
		firstRowOfMetrics.parentNode.appendChild(totalCostRow);
	}
};

function waitFor(isPresent, callback) {
	if (isPresent()) {
		callback();
		return;
	}
	var time = 0;
	var key = setInterval(function () {
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

function waitAndEnhance() {
	waitFor(() => {
		var list = document.querySelectorAll('dax-service-metrics div.p6n-kv-list-value span span');

		return list !== undefined && list.length >= 8 && list[0].innerHTML.trim() !== '–' ;
	}, enhancePanel);
}

window.addEventListener('load', () => {
	waitAndEnhance();
	waitFor(() => {
		var body = document.querySelector(".p6n-dax-graph");
		return body !== undefined && body !== null;
	}, () => {
		document.querySelector(".p6n-dax-graph").addEventListener('click', waitAndEnhance);
	});
});
