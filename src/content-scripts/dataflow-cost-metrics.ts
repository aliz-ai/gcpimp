import { format, parse } from 'bytes';
import { billingService, DataflowCostMetricPrices } from '../common/billing.service';

const daxServiceMetrics = 'dax-service-metrics';
const list = '.p6n-kv-list';
const listItemClassName = 'p6n-kv-list-item';
const gcpCostMetric = 'gcpimp-cost-metric';

const getDaxServiceMetrics = () => document.querySelector(daxServiceMetrics) as HTMLElement;
const getList = () => getDaxServiceMetrics().querySelector(list);
const getListItems = () => Array.from(getList().querySelectorAll('.' + listItemClassName));
const getCostMetrics = () => Array.from(getList().querySelectorAll('.' + gcpCostMetric));

const createListItem = (key: string, value: string) => {
	const newListItem = document.createElement('div');
	newListItem.className = listItemClassName + ' ' + gcpCostMetric;
	newListItem.innerHTML = `
	<div class="p6n-kv-list-key">
		<span>${key}</span>
	</div>
	<div class="p6n-kv-list-values">
		<div class="p6n-kv-list-value">
			<span>${value}</span>
		</div>
	</div>
	`;
	return newListItem;
};

async function elementLoaded<T>(supplier: () => T, parentElement = document.body) {
	const loaded = supplier();
	if (!!loaded) {
		return loaded;
	}
	const watchMutations = new Promise<T>(resolve => {
		const observer = new MutationObserver(() => {
			const result = supplier();
			if (!!result) {
				observer.disconnect();
				resolve(result);
			}
		});
		observer.observe(parentElement, { childList: true, subtree: true });
	});
	await watchMutations;
}

const selectorLoaded = (selector: string, parentElement: HTMLElement) =>
	elementLoaded(() => parentElement.querySelector(selector), parentElement);

type JobProperties = Record<string, string> & {
	zone?: string;
	region?: string;
	Region?: string;
	'Job type'?: 'Streaming' | 'Batch';
	'Current PD'?: string;
	'Current SSD PD'?: string;
	'Current memory'?: string;
	'Current vCPUs'?: string;
	'Total PD time'?: string;
	'Total SSD PD time'?: string;
	'Total memory time'?: string;
	'Total vCPU time'?: string;
};

function getJobProperties(): JobProperties {
	const listItems = Array.from(document.querySelectorAll('.' + listItemClassName));
	const itemValueMap: JobProperties = {};
	listItems.forEach(item => {
		const keyEl = item.querySelector('.p6n-kv-list-key>div, .p6n-kv-list-key>span');
		if (!keyEl) {
			return;
		}
		const key = keyEl.textContent.trim();
		const value = item.querySelector('.p6n-kv-list-value').textContent.trim();
		itemValueMap[key] = value;
	});
	return itemValueMap;
}

const zoneToRegion = (zone: string) => {
	if (!zone) {
		return;
	}
	const zoneParts = zone.split('-');
	zoneParts.splice(-1, 1);
	return zoneParts.join('-');
};

function findRegion(jobProperties = getJobProperties()) {
	const zoneRegion = jobProperties.zone ? zoneToRegion(jobProperties.zone) : undefined;
	const overriddenRegion = jobProperties.region;
	const defaultRegion = jobProperties.Region;

	return zoneRegion || overriddenRegion || defaultRegion;
}

const gbValue = (value: string) => {
	const valueStripped = (value || '').replace('hr', '').trim();
	const parseGBValueToBytes = parse(valueStripped);
	const formatBytesToGBString = format(parseGBValueToBytes, { unit: 'GB', unitSeparator: ' ' });
	const stringGbValue = (formatBytesToGBString || '').split(' ')[0];
	return Number.parseFloat(stringGbValue);
};

const getCpuPrice = (prices: DataflowCostMetricPrices, job: JobProperties) =>
	job['Job type'] === 'Batch' ? prices.vCPUTimeBatch : prices.vCPUTimeStreaming;

function calculateCurrentCost(prices: DataflowCostMetricPrices, job = getJobProperties()) {
	const currentPD = gbValue(job['Current PD'] || '');
	const currentPDSSD = gbValue(job['Current SSD PD'] || '');
	const currentMemory = gbValue(job['Current memory'] || '');
	const currentVCPUs = Number.parseFloat(job['Current vCPUs'] || '');

	const cpuPrice = getCpuPrice(prices, job);

	const cost =
		currentPD * prices.localDiskTimePdStandard.amount +
		currentPDSSD * prices.localDiskTimePDSSD.amount +
		currentMemory * prices.ramTime.amount +
		currentVCPUs * cpuPrice.amount;

	return cost.toFixed(2) + ' ' + prices.ramTime.currencyCode + '/ hr';
}

function calculateTotalCost(prices: DataflowCostMetricPrices, job = getJobProperties()) {
	const totalPDTime = gbValue(job['Total PD time'] || '');
	const totalPDSSDTime = gbValue(job['Total SSD PD time'] || '');
	const totalMemoryTime = gbValue(job['Total memory time'] || '');
	const totalVCPUTime = Number.parseFloat((job['Total vCPU time'] || '').split(' ')[0]);

	const cpuPrice = getCpuPrice(prices, job);

	const cost =
		totalPDTime * prices.localDiskTimePdStandard.amount +
		totalPDSSDTime * prices.localDiskTimePDSSD.amount +
		totalMemoryTime * prices.ramTime.amount +
		totalVCPUTime * cpuPrice.amount;
	return cost.toFixed(2) + ' ' + prices.ramTime.currencyCode;
}

async function appendCostMetrics() {
	await elementLoaded(getDaxServiceMetrics);
	await elementLoaded(getList, getDaxServiceMetrics());
	const job = getJobProperties();
	const region = findRegion(job);
	if (!region) {
		return;
	}
	const prices = await billingService.getDataflowCostMetricsPrices(region);

	const listEl = getList();

	const currentCost = calculateCurrentCost(prices, job);
	const totalCost = calculateTotalCost(prices, job);
	listEl.appendChild(createListItem('Current cost', currentCost));
	listEl.appendChild(createListItem('Total cost', totalCost));
}

const removeAddedCostMetrics = () =>
	Array.from(document.querySelectorAll('.' + gcpCostMetric)).forEach(el => el.remove());

async function listenToMetricsChanges() {
	await elementLoaded(getDaxServiceMetrics);
	await elementLoaded(getList, getDaxServiceMetrics());

	return setInterval(() => {
		removeAddedCostMetrics();
		appendCostMetrics();
	}, 1000);
}

appendCostMetrics();
listenToMetricsChanges();
