
export interface Storage {
	toolbarColor: {
		[projectId: string]: string;
	};
}

const DEFAULT_CUSTOM_TOOLBAR_COLOR = '#85144b';

type StorageKeys = keyof Storage;

export class ConfigService {

	private storageSyncGet = <P extends StorageKeys>(keys: P) =>
		new Promise<Pick<Storage, P>>(resolve => chrome.storage.sync.get(keys, resolve))

	private storageSyncSet = (storage: Partial<Storage>) =>
		new Promise(resolve => chrome.storage.sync.set(storage, resolve))

	public async setCustomToolbarColor(domain: string, color: string) {
		const storage = await this.storageSyncGet('toolbarColor');
		await this.storageSyncSet({
			toolbarColor: {
				...storage.toolbarColor,
				[domain]: color,
			},
		});
	}

	public async getCustomToolbarColor(projectId: string)  {
		const storage = await this.storageSyncGet('toolbarColor');
		if (!storage.toolbarColor) {
			return DEFAULT_CUSTOM_TOOLBAR_COLOR;
		}
		return storage.toolbarColor[projectId] || DEFAULT_CUSTOM_TOOLBAR_COLOR;
	}
}

export const configService = Object.freeze(new ConfigService());
