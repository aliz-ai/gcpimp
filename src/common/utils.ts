
export const getProjectId = (url: string) => new URL(url).searchParams.get('project');

type UrlChangeHandler = (url: string) => any;
export const onUrlChange = (handler: UrlChangeHandler) => {
	let oldHref = document.location.href;
	const body = document.querySelector('body');
	const observer = new MutationObserver(() => {
		const newHref = document.location.href;
		if (oldHref !== newHref) {
			oldHref = newHref;
			handler(newHref);
		}
	});
	observer.observe(body, { childList: true, attributes: true, subtree: true });
	return () => observer.disconnect();
};
