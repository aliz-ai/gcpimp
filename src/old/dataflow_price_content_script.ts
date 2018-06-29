import { waitFor } from './utils';

class DataflowJobPage {
	public readonly selector = {
		metrics: 'dax-service-metrics',
		defaultValueContent: 'dax-default-value span span',

		list: 'div.p6n-kv-list',
		listItem: 'div.p6n-kv-list-item',
		listValues: 'div.p6n-kv-list-value span span',
		listItemDefaultValue: 'dax-default-value span span',
	};
	public metrics = () => document.querySelector(this.selector.metrics);
	public metricList = () => Array.from(document.querySelectorAll('dax-service-metrics div.p6n-kv-list-value span span'));
	public lists = () => Array.from(document.querySelectorAll(this.selector.list));
	public pipelineOptionListItems = () => Array.from(this.lists()[3].querySelectorAll('div.p6n-kv-list-item'));
	public jobSectionListItems = () => Array.from(document.querySelectorAll('dax-job-section div.p6n-kv-list div.p6n-kv-list-item'));
}
const page = new DataflowJobPage();

class Size {
	constructor(private readonly value: number, readonly size: string) { }

	public static of(size: string): Size {
		const parts = size.trim().split(' ');
		return new Size(parseFloat(parts[0]), parts[1]);
	}

	get valueInGB(): number {
		switch (this.size) {
			case 'B':
				return this.value / (1024 ** 3);
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

	public readonly currentCPU: number;
	public readonly totalCPU: number;

	public readonly currentMemory: Size;
	public readonly totalMemory: Size;

	public readonly currentPD: Size;
	public readonly totalPD: Size;

	public readonly currentSSD: Size;
	public readonly totalSSD: Size;

	constructor(metrics: Element[]) {
		const metricsContent = metrics.map(el => el.innerHTML);

		[
			this.currentCPU,
			this.totalCPU,
		] = metricsContent
				.slice(0, 2)
				.map(v => this.parseValue(v));

		[
			this.currentMemory,
			this.totalMemory,
			this.currentPD,
			this.totalPD,
			this.currentSSD,
			this.totalSSD,
		] = metricsContent
				.slice(2)
				.map(v => Size.of(v));
	}

	private parseValue(metricString: string): number {
		return parseFloat(metricString.trim().split(' ')[0]);
	}
}

interface GCPPrices {
	[priceCategory: string]: {
		[continent: string]: number;
	};
}

const pricesPromise = fetch('https://cloudpricingcalculator.appspot.com/static/data/pricelist.json')
	.then(response => response.json())
	.then(response => response.gcp_price_list as GCPPrices);

function observeMeasures(callback: () => void): void {
	// create an observer instance
	const observer: MutationObserver = new MutationObserver(mutations => callback());

	// configuration of the observer:
	const config = {
		characterData: true,
		subtree: true,
	};

	// pass in the target node, as well as the observer options
	observer.observe(page.metrics(), config);
}

const updateValues = async (currentCostRow: Element, totalCostRow: Element) => {
	const metrics = new Metrics(page.metricList());

	const findValueByKey = (listItems: Element[], key) => listItems
		.map(e => (e as HTMLElement).innerText)
		.find(c => c.includes(key))
		.split('\t')[1]
		.trim();

	const continent = findValueByKey(page.pipelineOptionListItems(), 'zone');
	const jobType = findValueByKey(page.jobSectionListItems(), 'Job type');

	const prices = await pricesPromise;
	const priceOf = item => prices['CP-DATAFLOW-' + jobType + '-' + item][continent];
	const cpuPrice: number = priceOf('VCPU');
	const memoryPrice: number = priceOf('MEMORY');
	const pdPrice: number = priceOf('STORAGE-PD');
	const ssdPrice: number = priceOf('STORAGE-PD-SSD');

	const currentCost: number = metrics.currentCPU * cpuPrice
		+ metrics.currentMemory.valueInGB * memoryPrice
		+ metrics.currentPD.valueInGB * pdPrice
		+ metrics.currentSSD.valueInGB * ssdPrice;

	const totalCost: number = metrics.totalCPU * cpuPrice
		+ metrics.totalMemory.valueInGB * memoryPrice
		+ metrics.totalPD.valueInGB * pdPrice
		+ metrics.totalSSD.valueInGB * ssdPrice;

	const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD', currencyDisplay: 'symbol', maximumFractionDigits: 2 };

	currentCostRow
		.querySelector(page.selector.defaultValueContent)
		.innerHTML = currentCost.toLocaleString('en-US', currencyFormat) + ' /hr';

	totalCostRow
		.querySelector(page.selector.defaultValueContent)
		.innerHTML = totalCost.toLocaleString('en-US', currencyFormat);
};

const enhancePanel = () => {
	const metrics = document.querySelectorAll('dax-service-metrics div.p6n-kv-list-value span span');

	// this should be 8 or 9 by default, so we'll only add the properties once
	if (metrics.length <= 9) {
		const firstRowOfMetrics: Element = document.querySelector('dax-service-metrics div.p6n-kv-list-item');

		const currentCostRow: Element = firstRowOfMetrics.cloneNode(true) as Element;
		const totalCostRow: Element = firstRowOfMetrics.cloneNode(true) as Element;

		currentCostRow.querySelector('div.p6n-kv-list-key > span:first-child').innerHTML = ' Current cost ';
		totalCostRow.querySelector('div.p6n-kv-list-key > span:first-child').innerHTML = ' Total cost ';
		currentCostRow.querySelector('div.p6n-kv-list-key > span:last-child').remove();
		totalCostRow.querySelector('div.p6n-kv-list-key > span:last-child').remove();

		firstRowOfMetrics.parentNode.appendChild(currentCostRow);
		firstRowOfMetrics.parentNode.appendChild(totalCostRow);

		observeMeasures(() => updateValues(currentCostRow, totalCostRow));
		updateValues(currentCostRow, totalCostRow);
	}
};

function waitAndEnhance(): void {
	waitFor(() => {
		const list = document.querySelectorAll('dax-service-metrics div.p6n-kv-list-value span span');
		return list !== undefined && list.length >= 8 && list[0].innerHTML.trim() !== '–';
	})
		.then(enhancePanel);
}

waitAndEnhance();
waitFor(() => !!document.querySelector('.p6n-dax-graph'))
	.then(() => document.querySelector('.p6n-dax-graph')
		.addEventListener('click', waitAndEnhance));
