function onError(e) {
    console.error(e);
}

const options = {
    magnitude: 7,
    fontSize: 30,
    text: chrome.i18n.getMessage("defaultText"),
    textOptions: "radioNone",
    resizeImage: true,
    maxImageSize: 800
};

function save_image_to_local_storage(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";
    
    xhr.addEventListener("load", function () {
        if (xhr.readyState == 4 && xhr.status === 200) {
            var fileReader = new FileReader();
            fileReader.onload = function (evt) {
                localStorage.image = evt.target.result;
                callback();
            };
            fileReader.readAsDataURL(xhr.response);
        } else {
            console.log("unable to load file");
        }
    });
    xhr.addEventListener("error", function () {
        console.log("The server didn't serve us the file");
    });
    xhr.send();
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "intensify") {
        save_image_to_local_storage(info.srcUrl, () => {
            let tabId = sessionStorage.getItem('tabId');
            tabId = tabId ? parseInt(tabId, 10) : 0;//chrome.tabs.TAB_ID_NONE;
            chrome.tabs.get(tabId, createTab);
        });
    }
});

function createTab(tab) {
    const page_url = "/page/intensify.html"
    if (chrome.runtime.lastError) {
        chrome.tabs.create({
            "url": page_url
        }, (tab) => {
            sessionStorage.setItem('tabId', tab.id);
        });
    } else {
        chrome.tabs.update(tab.id, {
            active: true,
            "url": page_url
        })
    }
}

chrome.contextMenus.create({
    id: "intensify",
    title: chrome.i18n.getMessage("menuItemIntensify"),
    contexts: ["image"]
});

chrome.storage.sync.get("options", result => {
    if (Object.keys(result).length === 0) {
        chrome.storage.sync.set({options: options});
    }
});
