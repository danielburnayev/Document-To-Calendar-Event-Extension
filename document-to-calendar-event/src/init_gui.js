function init() {
    function makeObjectHidden(obj) {
        obj.classList.add("hidden-stuff");
    }
    function makeObjectVisible(obj) {
        obj.classList.remove("hidden-stuff");
    }
    function hideFlexContainer(obj) {
        obj.style.display = "none";
    }
    function showFlexContainer(obj) {
        obj.style.display = "flex";
    }
    function setFileSelectedText(text) {
        fileSelectedText.textContent = text;
    }
    function forceExtensionHeight(newHeight) {
        theHTMLElement.style.height = newHeight;
    }
    const ogHeight = document.body.clientHeight + "px";
    const theHTMLElement = document.querySelector('html');
    const screenshotButton = document.getElementById("screenshot-btn");
    const screenshotGif = document.getElementById("screenshot-gif");
    const orText = document.getElementById("or-text");
    const uploadGif = document.getElementById("upload-gif");
    const uploadButton = document.getElementById("upload-btn");
    const fileSelector = document.getElementById("actual-file-selector");
    const fileSelectorContent = document.getElementById("selected-file-stuff");
    const fileSelectedText = document.getElementById("file-selected-text");
    const cancelFileButton = document.getElementById("cancel-file-btn");
    const submitButton = document.getElementById("submit-btn");
    const optionButtonContainer = document.getElementById("option-btn-container");
    const otherButtonContainer = document.getElementById("other-btn-container");
    const textContainer = document.getElementById("text-container");
    const selectedFileImage = document.getElementById("selected-file-image");
    let fileChosen = false;
    let screenshotTaken = false;
    let screenshotInProgress = false;
    let fileType;
    let base64ImgData;
    // does the null checking for us ahead of time
    if (!allItemsPresent([theHTMLElement, uploadButton, fileSelector, fileSelectorContent, submitButton, fileSelectedText, cancelFileButton,
        screenshotButton, orText, uploadGif, optionButtonContainer, otherButtonContainer, textContainer, selectedFileImage])) {
        return;
    }
    forceExtensionHeight(ogHeight);
    screenshotButton.onmouseover = function () {
        makeObjectHidden(orText);
        makeObjectHidden(uploadButton);
        makeObjectVisible(screenshotGif);
        showFlexContainer(fileSelectorContent);
        if (!screenshotTaken) {
            setFileSelectedText("No Screenshot Taken");
        }
    };
    screenshotButton.onmouseleave = function () {
        makeObjectVisible(orText);
        makeObjectVisible(uploadButton);
        makeObjectHidden(screenshotGif);
        if (!screenshotInProgress) {
            hideFlexContainer(fileSelectorContent);
            forceExtensionHeight(ogHeight);
        }
        setFileSelectedText((screenshotInProgress) ? "Screenshot In Progress" : "");
    };
    screenshotButton.onclick = async function () {
        // adjust the extension itself to be smaller to not get in the way of the screenshot
        screenshotInProgress = true;
        hideFlexContainer(optionButtonContainer);
        hideFlexContainer(otherButtonContainer);
        hideFlexContainer(textContainer);
        const minNeededHeight = fileSelectorContent.clientHeight;
        makeObjectVisible(cancelFileButton);
        forceExtensionHeight(minNeededHeight + "px");

        //take screenshot
        await chrome.tabs.captureVisibleTab(null, { format: 'png' }).then(
            function (dataURL) {
                fileType = "image/png"
                base64ImgData = dataURL.split(",")[1];

                selectedFileImage.src = dataURL;
                selectedFileImage.style.maxHeight = "150px";
            },
            function (error) {
                console.error(error);
            }
        );

        screenshotInProgress = false;
        screenshotTaken = true;
        setFileSelectedText("Screenshot Taken");
        showFlexContainer(otherButtonContainer);
        showFlexContainer(textContainer);
        makeObjectVisible(submitButton);
        forceExtensionHeight(ogHeight);
    };
    uploadButton.onmouseover = function () {
        makeObjectHidden(screenshotButton);
        makeObjectHidden(orText);
        makeObjectVisible(uploadGif);
        showFlexContainer(fileSelectorContent);
        if (!fileChosen) {
            setFileSelectedText("No File Selected");
        }
    };
    uploadButton.onmouseleave = function () {
        if (!fileChosen) {
            makeObjectVisible(screenshotButton);
            makeObjectVisible(orText);
            makeObjectHidden(uploadGif);
            hideFlexContainer(fileSelectorContent);
            setFileSelectedText("");
        }
    };
    uploadButton.onclick = function () { fileSelector.click(); };
    fileSelector.onchange = function () {
        if (fileSelector.files && fileSelector.files.length == 1) {
            setFileSelectedText(fileSelector.files[0].name);

            const reader = new FileReader();
            if (fileSelector.files && fileSelector.files[0]) {
                reader.readAsDataURL(fileSelector.files[0]);
                reader.onloadend = function () {
                    fileType = fileSelector.files[0].type;
                    base64ImgData = reader.result.split(",")[1];

                    selectedFileImage.src = reader.result;
                    selectedFileImage.style.maxHeight = "150px";
                };
            }

            if (!fileChosen) {
                fileChosen = true;
                makeObjectVisible(uploadGif);
                showFlexContainer(fileSelectorContent);
                makeObjectVisible(submitButton);
                makeObjectVisible(cancelFileButton);
                makeObjectHidden(screenshotButton);
                makeObjectHidden(orText);
            }
        }
    };
    cancelFileButton.onclick = function () {
        setFileSelectedText("");
        makeObjectHidden(cancelFileButton);

        if (fileChosen) {
            fileChosen = false;
            makeObjectHidden(uploadGif);
            hideFlexContainer(fileSelectorContent);
            makeObjectHidden(submitButton);
            makeObjectVisible(screenshotButton);
            makeObjectVisible(orText);
            fileSelector.value = '';

            selectedFileImage.src = '';
            selectedFileImage.removeAttribute("style");
        }
        else if (screenshotInProgress) {
            screenshotInProgress = false;
            showFlexContainer(optionButtonContainer);
            showFlexContainer(otherButtonContainer);
            showFlexContainer(textContainer);
            forceExtensionHeight(ogHeight);
        }
        else if (screenshotTaken) {
            screenshotTaken = false;
            showFlexContainer(optionButtonContainer);
            makeObjectHidden(submitButton);

            selectedFileImage.src = '';
            selectedFileImage.removeAttribute("style");
        }
        else {
            console.error("This button shouldn't be visible, let alone clickable, at this very moment. ERROR!");
        }
    };
    submitButton.onclick = function () {
        // bring up fileType and base64ImgData
        // access google gemini in the backend
    };
}
function allItemsPresent(items) {
    let result = true;
    for (let item of items) {
        result && (result = item !== null);
        if (!result) {
            console.log("Not all DOM elements have been initalized as of the running of this script. Please refresh this Chrome Extension and try again.");
            break;
        }
    }
    return result;
}
init();
