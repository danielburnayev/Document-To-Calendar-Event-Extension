function init() {
    var screenshotButton = document.getElementById("screenshot-btn");
    var orText = document.getElementById("or-text");
    var uploadButton = document.getElementById("upload-btn");
    var fileSelector = document.getElementById("actual-file-selector");
    var fileSelectorContent = document.getElementById("selected-file-stuff");
    var submitButton = document.getElementById("submit-btn");
    var cancelFileButton = document.getElementById("cancel-file-btn");
    var chosen = false;
    function hideFileSelectorContent() {
        fileSelectorContent.classList.add("hidden-stuff");
        fileSelectorContent.removeAttribute("style");
    }
    function showFileSelectorContent() {
        fileSelectorContent.classList.remove("hidden-stuff");
        fileSelectorContent.style.display = "flex";
    }
    if (!allItemsPresent([uploadButton, fileSelector, fileSelectorContent, submitButton, cancelFileButton])) {
        return;
    }
    uploadButton.onmouseover = function () {
        screenshotButton.style.visibility = "hidden";
        orText.style.visibility = "hidden";
        showFileSelectorContent();
    };
    uploadButton.onmouseleave = function () {
        if (!chosen) {
            screenshotButton.removeAttribute("style");
            orText.removeAttribute("style");
            hideFileSelectorContent();
        }
    };
    uploadButton.onclick = function () { fileSelector.click(); };
    fileSelector.onchange = function () {
        if (fileSelector.files && fileSelector.files.length > 0) {
            fileSelectorContent.children[0].textContent = fileSelector.files[0].name;
            if (!chosen) {
                chosen = true;
                showFileSelectorContent();
                submitButton.classList.remove("hidden-stuff");
                cancelFileButton.style.display = "block";
            }
        }
    };
    cancelFileButton.onclick = function () {
        fileSelectorContent.children[0].textContent = "No File Selected";
        chosen = false;
        hideFileSelectorContent();
        submitButton.classList.add("hidden-stuff");
        cancelFileButton.removeAttribute("style");
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
