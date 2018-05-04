function updateUI(restoredSettings) {
    const linkRangeToValue = (range, display) => {
        display.textContent = range.value;
        range.addEventListener('input', () => display.textContent = range.value);
    }
    const linkCheckboxToInput = (checkbox, input) => {
        input.disabled = !checkbox.checked;
        checkbox.addEventListener('change', () => input.disabled = !checkbox.checked);
    }
    const restoreRadioButton = () => {
        let radioButtons = document.getElementsByName("textRadio");
        for (let i = 0; i < radioButtons.length; i++) {
            if (radioButtons[i].id === restoredSettings.textOptions) {
                radioButtons[i].checked = true;
                return;
            }
        }
        // not found, default to 0 (None)
        radioButtons[0].checked = true;
    }
    /* i18n the text, using https://github.com/erosman/HTML-Internationalization */
    for (let node of document.querySelectorAll('[data-i18n]')) {
        let [text, attr] = node.dataset.i18n.split('|');
        text = chrome.i18n.getMessage(text);
        attr ? node[attr] = text : node.appendChild(document.createTextNode(text));
    }
    /*****************************/
    const font_size_range = document.getElementById("font_range");
    const magnitude_range = document.getElementById("magnitude_range");
    const scale_checkbox  = document.getElementById("scaleCheckbox");
    const maxImageSizeInput = document.getElementById("max_image_size");

    magnitude_range.value = restoredSettings.magnitude;
    font_size_range.value = restoredSettings.fontSize;
    scale_checkbox.checked = restoredSettings.resizeImage;
    maxImageSizeInput.value = restoredSettings.maxImageSize;
    document.getElementById("text").value = restoredSettings.text;
    restoreRadioButton();
    linkCheckboxToInput(scale_checkbox, maxImageSizeInput);
    linkRangeToValue(font_size_range, document.getElementById("font_slider_value"));
    linkRangeToValue(magnitude_range, document.getElementById("magnitude_slider_value"));
}

function onError(e) {
    console.error(e);
}

function storeSettings() {
    const getMagnitude = () =>    document.getElementById("magnitude_range").value;
    const getFontSize = () =>     document.getElementById("font_range").value;
    const getText = () =>         document.getElementById("text").value;
    const getMaxImageSize = () => document.getElementById("max_image_size").value;
    const getTextOptions = () =>  document.querySelector('input[name="textRadio"]:checked').id;
    const getResizeImage = () =>  document.getElementById("scaleCheckbox").checked;
    const options = new Object();
    options.magnitude    = getMagnitude();
    options.fontSize     = getFontSize();
    options.text         = getText();
    options.maxImageSize = getMaxImageSize();
    options.textOptions  = getTextOptions();
    options.resizeImage  = getResizeImage();
    chrome.storage.sync.set({options: options});
}

document.getElementById("save-button").addEventListener("click", storeSettings);
chrome.storage.sync.get("options", result => { updateUI(result.options)} );

var cssLink = document.createElement("link");
cssLink.href = window.frameElement?"./options_page.css":"./options_ui.css";
cssLink.rel = "stylesheet";
cssLink.type = "text/css";
document.body.appendChild(cssLink);