
export enum MessageType {
	CONFIG_UPDATE = 'config-update',
}

export interface Message {
	type: MessageType;
}
