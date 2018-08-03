import { configService } from '../common/config.service';
import { MessageType } from '../common/message';
import { getProjectId } from '../common/utils';

const TOOLBAR_SELECTOR = '.pcc-platform-bar-container';

const defaultToolbarColor: string = document.querySelector<HTMLElement>(TOOLBAR_SELECTOR).style.backgroundColor;

async function customizeToolbarColor() {
	const projectId = getProjectId(document.location.href);

	const color = await configService.getCustomToolbarColor(projectId) || defaultToolbarColor;

	const toolbar = document.querySelector<HTMLElement>(TOOLBAR_SELECTOR);

	toolbar.style.backgroundColor = color;
	toolbar.style.transition = 'background-color 0.5s linear';
}

customizeToolbarColor();

chrome.runtime.onMessage.addListener(message => {
	if (message.type === MessageType.CONFIG_UPDATE) {
		customizeToolbarColor();
	}
});

let oldHref = document.location.href;
const body = document.querySelector('body');
const observer = new MutationObserver(() => {
	if (oldHref !== document.location.href) {
		oldHref = document.location.href;
		customizeToolbarColor();
	}
});

observer.observe(body, { childList: true, attributes: true, subtree: true });
