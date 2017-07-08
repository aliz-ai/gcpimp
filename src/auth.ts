export class AuthToken {
    constructor() { }

    getAuthToken(): Promise<string> {
        return new Promise<string>((resolve: (string) => void, reject: (any) => void) => {
            chrome.identity.getAuthToken({
                interactive: true,
                scopes: ['https://www.googleapis.com/auth/bigquery', 'https://www.googleapis.com/auth/devstorage.full_control']
            }, token => {
                if (token === undefined) {
                    reject("Error while getting token!");
                } else {
                    resolve(token);
                }
            });
        });
    }
}
