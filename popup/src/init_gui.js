function init() {
    function makeObjectHidden(obj) {
        obj.classList.add("hidden-stuff");
    }
    function makeObjectVisible(obj) {
        obj.classList.remove("hidden-stuff");
    }
    function hideFileSelectorContent() {
        makeObjectHidden(fileSelectorContent);
        fileSelectorContent.removeAttribute("style");
    }
    function showFileSelectorContent() {
        makeObjectVisible(fileSelectorContent);
        fileSelectorContent.style.display = "flex";
    }
    function setFileSelectedText(text) {
        fileSelectedText.textContent = text;
    }
    var screenshotButton = document.getElementById("screenshot-btn");
    var screenshotGif = document.getElementById("screenshot-gif");
    var orText = document.getElementById("or-text");
    var uploadGif = document.getElementById("upload-gif");
    var uploadButton = document.getElementById("upload-btn");
    var fileSelector = document.getElementById("actual-file-selector");
    var fileSelectorContent = document.getElementById("selected-file-stuff");
    var fileSelectedText = document.getElementById("file-selected-text");
    var cancelFileButton = document.getElementById("cancel-file-btn");
    var submitButton = document.getElementById("submit-btn");
    var fileChosen = false;
    var screenshotTaken = false;
    if (!allItemsPresent([uploadButton, fileSelector, fileSelectorContent, submitButton, fileSelectedText, cancelFileButton, screenshotButton, orText, uploadGif])) {
        return;
    }
    screenshotButton.onmouseover = function () {
        makeObjectHidden(orText);
        makeObjectHidden(uploadButton);
        makeObjectVisible(screenshotGif);
        showFileSelectorContent();
        setFileSelectedText("No Screenshot Taken");
    };
    screenshotButton.onmouseleave = function () {
        makeObjectVisible(orText);
        makeObjectVisible(uploadButton);
        makeObjectHidden(screenshotGif);
        hideFileSelectorContent();
        setFileSelectedText("");
    };
    uploadButton.onmouseover = function () {
        makeObjectHidden(screenshotButton);
        makeObjectHidden(orText);
        makeObjectVisible(uploadGif);
        showFileSelectorContent();
        if (!fileChosen) {
            setFileSelectedText("No File Selected");
        }
    };
    uploadButton.onmouseleave = function () {
        if (!fileChosen) {
            makeObjectVisible(screenshotButton);
            makeObjectVisible(orText);
            makeObjectHidden(uploadGif);
            hideFileSelectorContent();
            setFileSelectedText("");
        }
    };
    uploadButton.onclick = function () { fileSelector.click(); };
    fileSelector.onchange = function () {
        if (fileSelector.files && fileSelector.files.length == 1) {
            setFileSelectedText(fileSelector.files[0].name);
            if (!fileChosen) {
                fileChosen = true;
                makeObjectVisible(uploadGif);
                showFileSelectorContent();
                makeObjectVisible(submitButton);
                makeObjectVisible(cancelFileButton);
                makeObjectHidden(screenshotButton);
                makeObjectHidden(orText);
            }
        }
    };
    cancelFileButton.onclick = function () {
        fileChosen = false;
        setFileSelectedText("");
        makeObjectHidden(uploadGif);
        hideFileSelectorContent();
        makeObjectHidden(submitButton);
        makeObjectHidden(cancelFileButton);
        makeObjectVisible(screenshotButton);
        makeObjectVisible(orText);
        fileSelector.value = '';
    };
}
function allItemsPresent(items) {
    var result = true;
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        result && (result = item !== null);
        if (!result) {
            console.log("Not all DOM elements have been initalized as of the running of this script. Please refresh this Chrome Extension and try again.");
            break;
        }
    }
    return result;
}
init();
