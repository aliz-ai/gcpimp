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

async function findListItemValue(key: string) {
	const findListItems = () => Array.from(document.querySelectorAll('.' + listItemClassName)).find(el => el.textContent.includes(key)) as HTMLElement;
	const listItem = await elementLoaded(findListItems, document.body);
	const listItemValue = listItem.querySelector('.p6n-kv-list-value') as HTMLDivElement;
	if (listItemValue.innerText.trim() === '–') {
		await new Promise(res => {
			const observer = new MutationObserver(() => {
				observer.disconnect();
				res();
			});
			observer.observe(listItemValue, { characterData: true });
		});
	}
	const regionValue = listItemValue.innerText.trim();
	return regionValue;
}

async function findRegion() {
	const zoneToRegion = (zone: string) => {
		if (!zone) {
			return;
		}
		const zoneParts = zone.split('-');
		zoneParts.splice(-1, 1);
		return zoneParts.join('-');
	};
	const zoneRegion = findListItemValue('zone').then(zoneToRegion);
	const overriddenRegion = findListItemValue('region');
	const defaultRegion = findListItemValue('Region');

	return Promise.race([zoneRegion, overriddenRegion, defaultRegion]);
}

const gbValue = (value: string) => Number.parseFloat(
	format(parse(value.replace('hr', '').trim()), { unit: 'GB', unitSeparator: ' ' }).split(' ')[0]);

const cutEndingHr = (s: string) => s.replace('hr', '');

const getCpuPrice = async (prices: DataflowCostMetricPrices) => {
	const jobType = await findListItemValue('Job type');
	return jobType === 'Batch' ? prices.vCPUTimeBatch : prices.vCPUTimeStreaming;
};

async function calculateCurrentCost(prices: DataflowCostMetricPrices) {
	const currentPD = gbValue(await findListItemValue('Current PD'));
	const currentPDSSD = gbValue(await findListItemValue('Current PD SSD'));
	const currentMemory = gbValue(await findListItemValue('Current memory'));
	const currentVCPUs = Number.parseFloat(await findListItemValue('Current vCPUs'));

	const cpuPrice = await getCpuPrice(prices);

	const cost =
		currentPD * prices.localDiskTimePdStandard.amount +
		currentPDSSD * prices.localDiskTimePDSSD.amount +
		currentMemory * prices.ramTime.amount +
		currentVCPUs * cpuPrice.amount;

	return cost.toFixed(2) + ' ' + prices.ramTime.currencyCode;
}

async function calculateTotalCost(prices: DataflowCostMetricPrices) {
	const totalPDTime = gbValue(await findListItemValue('Total PD time'));
	const totalPDSSDTime = gbValue(await findListItemValue('Total SSD PD time'));
	const totalMemoryTime = gbValue(await findListItemValue('Total memory time'));
	const totalVCPUTime = Number.parseFloat((await findListItemValue('Total vCPU time')).split(' ')[0]);

	const cpuPrice = await getCpuPrice(prices);

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
	const region = await findRegion();
	const prices = await billingService.getDataflowCostMetricsPrices(region);

	const listEl = getList();

	const currentCost = calculateCurrentCost(prices);
	const totalCost = calculateTotalCost(prices);

	await Promise.all([
		currentCost.then(cost => listEl.appendChild(createListItem('Current cost', cost))),
		totalCost.then(cost => listEl.appendChild(createListItem('Total cost', cost))),
	]);
}

const removeAddedCostMetrics = () =>
	Array.from(document.querySelectorAll('.' + gcpCostMetric)).forEach(el => el.remove());

async function listenToMetricsChanges() {
	await elementLoaded(getDaxServiceMetrics);
	await elementLoaded(getList, getDaxServiceMetrics());
	const listEl = getList();
	const observer = new MutationObserver(() => {
		observer.disconnect();
		removeAddedCostMetrics();
		appendCostMetrics();
		observer.observe(document.body, { childList: true, subtree: true, characterData: true });
	});
	observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

appendCostMetrics();
// listenToMetricsChanges();
