
const daxServiceMetrics = 'dax-service-metrics';
const list = '.p6n-kv-list';
const listItem = 'p6n-kv-list-item';
const gcpCostMetric = 'gcpimp-cost-metric';

const getDaxServiceMetrics = () => document.querySelector(daxServiceMetrics) as HTMLElement;
const getList = () => getDaxServiceMetrics().querySelector(list);
const getListItems = () => Array.from(getList().querySelectorAll('.' + listItem));
const getCostMetrics = () => Array.from(getList().querySelectorAll('.' + gcpCostMetric));

const createListItem = (key: string, value: string) => {
	const newListItem = document.createElement('div');
	newListItem.className = listItem + ' ' + gcpCostMetric;
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
	const findListItems = () => Array.from(document.querySelectorAll('.' + listItem)).find(el => el.textContent.includes(key)) as HTMLElement;
	const regionListItem = await elementLoaded(findListItems, document.body);
	const regionListItemValue = regionListItem.querySelector('.p6n-kv-list-value') as HTMLDivElement;
	const regionValue = regionListItemValue.innerText.trim();
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
	const zoneRegion = findListItemValue('zone').then(z => zoneToRegion(z));
	const overriddenRegion = findListItemValue('region');
	const defaultRegion = findListItemValue('Region');

	return Promise.race([zoneRegion, overriddenRegion, defaultRegion]);
}

function calculateCurrentCost() {
	return 'TODO';
}

function calculateTotalCost() {
	return 'TODO';
}

async function appendCostMetrics() {
	await elementLoaded(getDaxServiceMetrics);
	await elementLoaded(getList, getDaxServiceMetrics());
	const region = await findRegion();

	const listEl = getList();
	listEl.appendChild(createListItem('Current cost', calculateCurrentCost()));
	listEl.appendChild(createListItem('Total cost', calculateTotalCost()));
}

appendCostMetrics();
