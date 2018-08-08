import { CurrencyCode } from './currency-codes';
import { MessageType } from './message';

type ProjectId = string;

export interface Storage {
	toolbarColor: Record<ProjectId, string>;
	currencyCode: CurrencyCode;
}

type StorageKeys = keyof Storage;

export class ConfigService {

	private storageSyncGet = <P extends StorageKeys>(keys: P) =>
		new Promise<Pick<Storage, P>>(resolve => chrome.storage.sync.get(keys, resolve))

	private storageSyncSet = (storage: Partial<Storage>) =>
		new Promise(resolve => chrome.storage.sync.set(storage, resolve))

	public async setCustomToolbarColor(projectId: string, color: string) {
		const storage = await this.storageSyncGet('toolbarColor');
		await this.storageSyncSet({
			toolbarColor: {
				...storage.toolbarColor,
				[projectId]: color,
			},
		});
		this.sendUpdateToContentScripts();
	}

	public async getCustomToolbarColor(projectId: string)  {
		const storage = await this.storageSyncGet('toolbarColor');
		if (!storage.toolbarColor) {
			return undefined;
		}
		return storage.toolbarColor[projectId];
	}

	public async getCurrencyCode() {
		return (await this.storageSyncGet('currencyCode')).currencyCode;
	}

	public async setCurrencyCode(currencyCode: CurrencyCode) {
		await this.storageSyncSet({ currencyCode });
		this.sendUpdateToContentScripts();
	}

	public sendUpdateToContentScripts() {
		chrome.tabs.query({
			discarded: false,
			status: 'complete',
			url: '*://console.cloud.google.com/*',
		}, tabs =>
				tabs.forEach(tab =>
					chrome.tabs.sendMessage(tab.id, { type: MessageType.CONFIG_UPDATE })));
	}
}

export const configService = Object.freeze(new ConfigService());
