import { MessageType } from './message';

export interface Storage {
	toolbarColor: {
		[projectId: string]: string;
	};
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
