function parseMetric(metricString: string): number {
	return parseFloat(metricString.trim().split(' ')[0]);
}

var prices;
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
	if (xhr.readyState == 4) {
		prices = JSON.parse(xhr.responseText)["gcp_price_list"];
	}
}
xhr.open("GET", 'https://cloudpricingcalculator.appspot.com/static/data/pricelist.json', true);
xhr.send();

function observeMeasures(callback) {
	// select the target node
	var target = document.querySelector('dax-service-metrics');

	// create an observer instance
	var observer = new MutationObserver(mutations => callback());

	// configuration of the observer:
	var config = {
		characterData: true,
		subtree: true
	};

	// pass in the target node, as well as the observer options
	observer.observe(target, config);
}

var updateValues = function (currentCostRow, totalCostRow) {
	var metrics = document.querySelectorAll('dax-service-metrics div.p6n-kv-list-value span span');

	var currentCPU = parseMetric(metrics[0].innerHTML)
	var totalCPU = parseMetric(metrics[1].innerHTML)

	var currentMemory = parseMetric(metrics[2].innerHTML)
	var totalMemory = parseMetric(metrics[3].innerHTML)

	var currentPD = parseMetric(metrics[4].innerHTML)
	var totalPD = parseMetric(metrics[5].innerHTML)

	var currentSSD = parseMetric(metrics[6].innerHTML)
	var totalSSD = parseMetric(metrics[7].innerHTML)

	var pipelineOptions = document.querySelectorAll(".p6n-vulcan-panel-content > div > div > div:nth-of-type(2) div.p6n-kv-list-key > span");
	var zone;
	for (let child of pipelineOptions) {
		if (child.innerHTML.trim() === 'zone') {
			zone = child.parentNode.parentNode.querySelector('dax-default-value span span').innerHTML.trim();
		}
	}

	var jobType = document.querySelectorAll('dax-job-section div.p6n-kv-list-values span span')[6].innerHTML.trim();

	var continent = zone.split('-')[0];

	var cpuPrice = prices["CP-DATAFLOW-" + jobType.toUpperCase() + "-VCPU"][continent];
	var memoryPrice = prices["CP-DATAFLOW-" + jobType.toUpperCase() + "-MEMORY"][continent];
	var pdPrice = prices["CP-DATAFLOW-" + jobType.toUpperCase() + "-STORAGE-PD"][continent];
	var ssdPrice = prices["CP-DATAFLOW-" + jobType.toUpperCase() + "-STORAGE-PD-SSD"][continent];

	var currentCost = currentCPU * cpuPrice + currentMemory * memoryPrice + currentPD * pdPrice + currentSSD * ssdPrice;
	var totalCost = totalCPU * cpuPrice + totalMemory * memoryPrice + totalPD * pdPrice + totalSSD * ssdPrice;

	currentCostRow.querySelector("div.p6n-kv-list-key > span:first-child").innerHTML = " Current cost ";
	currentCostRow.querySelector("dax-default-value span span").innerHTML = currentCost + " $/hr";
	totalCostRow.querySelector("div.p6n-kv-list-key > span:first-child").innerHTML = " Total cost ";
	totalCostRow.querySelector("dax-default-value span span").innerHTML = totalCost + " $";
}

var enhancePanel = function () {
	var metrics = document.querySelectorAll('dax-service-metrics div.p6n-kv-list-value span span');

	// this should be 8 or 9 by default, so we'll only add the properties once
	if (metrics.length <= 9) {
		var firstRowOfMetrics = document.querySelector('dax-service-metrics div.p6n-kv-list-item');

		var currentCostRow = firstRowOfMetrics.cloneNode(true);
		var totalCostRow = firstRowOfMetrics.cloneNode(true);

		currentCostRow.querySelector("div.p6n-kv-list-key > span:last-child").remove();
		totalCostRow.querySelector("div.p6n-kv-list-key > span:last-child").remove();

		firstRowOfMetrics.parentNode.appendChild(currentCostRow);
		firstRowOfMetrics.parentNode.appendChild(totalCostRow);

		observeMeasures(() => updateValues(currentCostRow, totalCostRow));
		updateValues(currentCostRow, totalCostRow);
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
		return list !== undefined && list.length >= 8 && list[0].innerHTML.trim() !== '–';
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
