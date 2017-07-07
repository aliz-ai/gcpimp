class Size {
	constructor(private readonly value: number, readonly size: string) { }

	static of(size: string): Size {
		let parts = size.trim().split(' ');
		return new Size(parseFloat(parts[0]), parts[1]);
	}

	get valueInGB(): number {
		switch (this.size) {
			case 'B':
				return this.value / (1024 ^ 3);
			case 'GB':
				return this.value;
			case 'TB':
				return this.value * 1024;
			default:
				break;
		}
	}
}

class Metrics {

	readonly currentCPU: number;
	readonly totalCPU: number;

	readonly currentMemory: Size;
	readonly totalMemory: Size;

	readonly currentPD: Size;
	readonly totalPD: Size;

	readonly currentSSD: Size;
	readonly totalSSD: Size;

	constructor(metrics: NodeListOf<Element>) {
		this.currentCPU = this.parseValue(metrics[0].innerHTML);
		this.totalCPU = this.parseValue(metrics[1].innerHTML);

		this.currentMemory = Size.of(metrics[2].innerHTML);
		this.totalMemory = Size.of(metrics[3].innerHTML);

		this.currentPD = Size.of(metrics[4].innerHTML);
		this.totalPD = Size.of(metrics[5].innerHTML);

		this.currentSSD = Size.of(metrics[6].innerHTML);
		this.totalSSD = Size.of(metrics[7].innerHTML);
	}

	private parseValue(metricString: string): number {
		return parseFloat(metricString.trim().split(' ')[0]);
	}
}

var prices: {};
var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
	if (xhr.readyState == 4) {
		prices = JSON.parse(xhr.responseText)["gcp_price_list"];
	}
}
xhr.open("GET", 'https://cloudpricingcalculator.appspot.com/static/data/pricelist.json', true);
xhr.send();

function observeMeasures(callback: () => void): void {
	// select the target node
	var target: Element = document.querySelector('dax-service-metrics');

	// create an observer instance
	var observer: MutationObserver = new MutationObserver(mutations => callback());

	// configuration of the observer:
	var config = {
		characterData: true,
		subtree: true
	};

	// pass in the target node, as well as the observer options
	observer.observe(target, config);
}

var updateValues = function (currentCostRow: Element, totalCostRow: Element): void {
	var metrics = new Metrics(document.querySelectorAll('dax-service-metrics div.p6n-kv-list-value span span'));

	var pipelineOptions: any = document.querySelectorAll(".p6n-vulcan-panel-content > div > div > div:nth-of-type(2) div.p6n-kv-list-key > span");
	var zone: string;
	for (let child of pipelineOptions) {
		if (child.innerHTML.trim() === 'zone') {
			zone = child.parentNode.parentNode.querySelector('dax-default-value span span').innerHTML.trim();
		}
	}
	var continent: string = zone.split('-')[0];

	var jobType: string = document.querySelectorAll('dax-job-section div.p6n-kv-list-values span span')[6].innerHTML.trim().toUpperCase();

	var cpuPrice: number = prices["CP-DATAFLOW-" + jobType + "-VCPU"][continent];
	var memoryPrice: number = prices["CP-DATAFLOW-" + jobType + "-MEMORY"][continent];
	var pdPrice: number = prices["CP-DATAFLOW-" + jobType + "-STORAGE-PD"][continent];
	var ssdPrice: number = prices["CP-DATAFLOW-" + jobType + "-STORAGE-PD-SSD"][continent];

	var currentCost: number = metrics.currentCPU * cpuPrice + metrics.currentMemory.valueInGB * memoryPrice + metrics.currentPD.valueInGB * pdPrice + metrics.currentSSD.valueInGB * ssdPrice;
	var totalCost: number = metrics.totalCPU * cpuPrice + metrics.totalMemory.valueInGB * memoryPrice + metrics.totalPD.valueInGB * pdPrice + metrics.totalSSD.valueInGB * ssdPrice;

	let currencyFormat: Intl.NumberFormatOptions = { style: "currency", currency: "USD", currencyDisplay: "symbol", maximumFractionDigits: 2 };
	currentCostRow.querySelector("dax-default-value span span").innerHTML = currentCost.toLocaleString('en-US', currencyFormat) + " /hr";
	totalCostRow.querySelector("dax-default-value span span").innerHTML = totalCost.toLocaleString('en-US', currencyFormat);
}

var enhancePanel = function (): void {
	var metrics = document.querySelectorAll('dax-service-metrics div.p6n-kv-list-value span span');

	// this should be 8 or 9 by default, so we'll only add the properties once
	if (metrics.length <= 9) {
		var firstRowOfMetrics: Element = document.querySelector('dax-service-metrics div.p6n-kv-list-item');

		var currentCostRow: Element = firstRowOfMetrics.cloneNode(true) as Element;
		var totalCostRow: Element = firstRowOfMetrics.cloneNode(true) as Element;

		currentCostRow.querySelector("div.p6n-kv-list-key > span:first-child").innerHTML = " Current cost ";
		totalCostRow.querySelector("div.p6n-kv-list-key > span:first-child").innerHTML = " Total cost ";
		currentCostRow.querySelector("div.p6n-kv-list-key > span:last-child").remove();
		totalCostRow.querySelector("div.p6n-kv-list-key > span:last-child").remove();

		firstRowOfMetrics.parentNode.appendChild(currentCostRow);
		firstRowOfMetrics.parentNode.appendChild(totalCostRow);

		observeMeasures(() => updateValues(currentCostRow, totalCostRow));
		updateValues(currentCostRow, totalCostRow);
	}
};

function waitFor(isPresent: () => boolean, callback: () => void) {
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

function waitAndEnhance(): void {
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
