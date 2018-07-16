const NANOS = 1e-9;

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
				nanos: number;
			},
		}[];
	};
	currencyConversionRate: number;
	effectiveTime: string;
}

interface CostMetricPrice {
	amount: number;
	currencyCode: string;
}

export interface DataflowCostMetricPrices {
		vCPUTimeBatch: CostMetricPrice;
		vCPUTimeStreaming: CostMetricPrice;
		localDiskTimePdStandard: CostMetricPrice;
		localDiskTimePDSSD: CostMetricPrice;
		ramTime: CostMetricPrice;
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

let services: GoogleService[];
let dataflowPrices: GoogleSKU[];

class BillingService {

	private async listServices() {
		const response = await fetch(`https://cloudbilling.googleapis.com/v1/services?key=${API_KEY}`);
		const serviceList: { services: GoogleService[] } = await response.json();
		services = serviceList.services;
		return services;
	}

	private async getDataflowServiceId() {
		const currentServices = services || await this.listServices();
		return currentServices.find(svc => svc.displayName === 'Cloud Dataflow').serviceId;
	}

	private async listDataflowPrices() {
		if (dataflowPrices) {
			return dataflowPrices;
		}
		const serviceId = await this.getDataflowServiceId();
		const response = await fetch(`https://cloudbilling.googleapis.com/v1/services/${serviceId}/skus?key=${API_KEY}`);
		const body: { skus: GoogleSKU[] } = await response.json();
		dataflowPrices = body.skus;
		return dataflowPrices;
	}

	private getPrice(service: string, prices: GoogleSKU[]): CostMetricPrice {
		const sku = prices.find(s => s.description.includes(service));
		const unitPrice = sku.pricingInfo[0].pricingExpression.tieredRates[0].unitPrice;
		return {
			amount: unitPrice.nanos * NANOS,
			currencyCode: unitPrice.currencyCode,
		};
	}

	public async getDataflowCostMetricsPrices(region: string): Promise<DataflowCostMetricPrices> {
		const prices = await this.listDataflowPrices();
		const regionalPrices = prices.filter(sku => sku.serviceRegions.includes(region));
		return {
			vCPUTimeBatch: this.getPrice('vCPU Time Batch', regionalPrices),
			vCPUTimeStreaming: this.getPrice('vCPU Time Streaming', regionalPrices),
			localDiskTimePdStandard: this.getPrice('Local Disk Time PD Standard', regionalPrices),
			localDiskTimePDSSD: this.getPrice('Local Disk Time PD SSD', regionalPrices),
			ramTime: this.getPrice('RAM Time', regionalPrices),
		};
	}

}

export const billingService = Object.freeze(new BillingService());
