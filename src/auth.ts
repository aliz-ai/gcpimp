export class AuthToken {
    getAuthToken(): Promise<string> {
        return new Promise<string>((resolve, reject) => chrome.identity.getAuthToken({
            interactive: true,
            scopes: ['https://www.googleapis.com/auth/bigquery', 'https://www.googleapis.com/auth/devstorage.full_control']
        }, token => token ? reject("Error while getting token!") : resolve(token)));
    }
}
