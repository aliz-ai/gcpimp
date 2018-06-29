class AuthToken {
	public getAuthToken(): Promise<string> {
		return new Promise<string>((resolve, reject) => chrome.identity.getAuthToken({
			interactive: true,
			scopes: ['https://www.googleapis.com/auth/bigquery', 'https://www.googleapis.com/auth/devstorage.full_control'],
		}, token => token ? reject('Error while getting token!') : resolve(token)));
	}
}

export const authToken = new AuthToken();

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	if (request.subject === 'authToken') {
		sendResponse({ authToken: await authToken.getAuthToken() });
	}
});
