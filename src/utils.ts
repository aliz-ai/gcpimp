export function waitFor(isPresent: () => boolean) {
	return Promise.race([...Array(10)]
		.map((u, idx) => idx * 100)
		.map(time => new Promise(resolve =>
			setTimeout(() => isPresent()
				? resolve()
				: undefined,
				time))));
}
