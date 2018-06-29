import { configService } from '../config.service';

const TOOLBAR_SELECTOR = '.pcc-platform-bar-container';

async function customizeToolbarColor() {
	const url = new URL(document.location.href);
	const projectId = url.searchParams.get('project');

	const color = await configService.getCustomToolbarColor(projectId);

	const toolbar = document.querySelector<HTMLElement>(TOOLBAR_SELECTOR);
	toolbar.style.backgroundColor = color;
}

customizeToolbarColor();
