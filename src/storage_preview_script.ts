function observeDOM(callback: () => void): void {
    // select the target node
    var target: Element = document.querySelector('#p6n-storage-objects-table');

    // create an observer instance
    var observer: MutationObserver = new MutationObserver(mutations => callback());

    // configuration of the observer:
    var config = {
        childList: true,
        characterData: true,
        subtree: true
    };

    // pass in the target node, as well as the observer options
    observer.observe(target, config);
}

function waitFor(isPresent: () => boolean, callback: () => void) {
    if (isPresent()) {
        callback();
        return;
    }
    var time = 0;
    var key = setInterval(function () {
        if (isPresent() || time > 10000) {
            clearInterval(key);
            if (isPresent()) {
                callback();
            }
            return;
        }
        time += 1000;
    }, 1000);
}

waitFor(() => {
    var body = document.querySelector('#p6n-storage-objects-table');
    return body !== undefined && body !== null;
}, () => {
    let update = () => {
        var rows = (document.querySelectorAll('#p6n-storage-objects-table > tbody > tr') as any) as Element[];
        for (let row of rows) {
            let menuTd = row.querySelector('td:nth-child(8)');
            let fileName = row.querySelector('td:nth-child(2) pre').innerHTML.trim();

            let previewButton = menuTd.querySelector('button');
            if (previewButton !== null) {
                continue;
            }
            previewButton = document.createElement("button");
            previewButton.innerHTML = " Preview file ";
            previewButton.addEventListener('click', () => {
                chrome.runtime.sendMessage({ subject: 'authToken' }, response => {
                    if (response === undefined) {
                        console.error(chrome.runtime.lastError);
                    } else {
                        let matches = window.location.href.match('https://console.cloud.google.com/storage/browser/([^/]+)/([^?]*)');
                        let bucket = matches[1];
                        let path = matches[2];
                        var xhr = new XMLHttpRequest();
                        xhr.addEventListener("load", () => {
                            var contentLoad = new XMLHttpRequest();
                            contentLoad.addEventListener("load", () => {
                                console.log(contentLoad.response);
                            });
                            contentLoad.open("GET", JSON.parse(xhr.response).mediaLink);
                            contentLoad.setRequestHeader("Authorization", "Bearer " + response.authToken);
                            contentLoad.setRequestHeader("Range", "bytes=0-5120");
                            contentLoad.send();
                        });
                        xhr.open("GET", 'https://www.googleapis.com/storage/v1/b/' + bucket + '/o/' + path + fileName, true);
                        xhr.setRequestHeader("Authorization", "Bearer " + response.authToken);
                        xhr.send();
                    }
                });
            });
            menuTd.insertBefore(previewButton, menuTd.querySelector('pan-overflow-menu'));
        }
    };
    observeDOM(update);
    update();
})
