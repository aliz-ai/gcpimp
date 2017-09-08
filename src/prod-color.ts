import { waitFor } from './utils';

const pageSystemBar = () => document.querySelector('.p6n-system-bar') as HTMLElement;

waitFor(() => !!pageSystemBar())
	.then(() => pageSystemBar().style.backgroundColor = 'rgb(175, 36, 36)');
