// body > pan-shell > div > div.layout-column.flex-none > pan-console-platform-bar > pan-platform-bar > header

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
    var body = document.querySelector(".p6n-system-bar");
    return body !== undefined && body !== null;
}, () => {
    console.log((document.querySelector(".p6n-system-bar") as HTMLElement).style.backgroundColor);
    (document.querySelector(".p6n-system-bar") as HTMLElement).style.backgroundColor = "rgb(175, 36, 36)";
});
