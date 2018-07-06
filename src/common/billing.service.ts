
interface GoogleService {
	name: string;
	serviceId: string;
	displayName: string;
}

interface GoogleSKUPricingInfo {
	summary: string;
	pricingExpression: {
		usageUnit: string;
		usegeUnitDescription: string;
		baseUnit: string;
		baseUnitConversionFactor: number;
		displayQuantity: number;
		tieredRates: {
			startUsageAmount: 0,
			unitPrice: {
				currencyCode: string;
				units: string;
				nanos: string;
			},
		}[];
	};
	currencyConversionRate: number;
	effectiveTime: string;
}

interface GoogleSKU {
	name: string;
	skuId: string;
	description: string;
	category: {};
	serviceRegions: string[];
	pricingInfo: GoogleSKUPricingInfo[];
	serviceProviderName: string;
}

const API_KEY = 'AIzaSyBZVfVwDKpduSuNOJlvWildIeQ5AsNtnWM';

class BillingService {
	private services: GoogleService[];
	private dataflowPrices: GoogleSKU[];

	private async listServices() {
		const response = await fetch(`https://cloudbilling.googleapis.com/v1/services?key=${API_KEY}`);
		const serviceList: { services: GoogleService[] } = await response.json();
		this.services = serviceList.services;
		return this.services;
	}

	private async getDataflowServiceId() {
		const services = this.services || await this.listServices();
		return services.find(svc => svc.displayName === 'Cloud Dataflow').serviceId;
	}

	private async listDataflowPrices() {
		if (this.dataflowPrices) {
			return this.dataflowPrices;
		}
		const serviceId = await this.getDataflowServiceId();
		const response = await fetch(`https://cloudbilling.googleapis.com/v1/services/${serviceId}/skus?key=${API_KEY}`);
		const body: { skus: GoogleSKU[] } = await response.json();
		this.dataflowPrices = body.skus;
		return this.dataflowPrices;
	}

	public async getDataflowCostMetricsPrices(region: string) {
		const prices = await this.listDataflowPrices();
		const regionalPrices = prices.filter(sku => sku.serviceRegions.includes(region));
		return {
			vCPUTimeBatch: 1,
			vCPUTimeStreaming: 1,
			localDiskTimePdStandard: 1,
			localDiskTimePDSSD: 1,
			ramTime: 1,
		};
	}

}

export const billingService = Object.freeze(new BillingService());
