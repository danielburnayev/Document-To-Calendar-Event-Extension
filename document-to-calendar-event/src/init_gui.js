function init() {
    function setFileSelectedText(text) {
        fileSelectedText.textContent = text;
    }
    function forceExtensionHeight(newHeight) {
        theHTMLElement.style.height = newHeight;
    }
    function addImageChanges(url) {
        selectedFileImage.src = url;
        selectedFileImage.style.maxHeight = "150px";
    }
    function removeImageChanges() {
        selectedFileImage.src = '';
        selectedFileImage.removeAttribute("style");
    }
    function resetPopupFromFileUpload() {
        fileChosen = false;
        hideFlexContainer(fileSelectorContent);
        makeObjectHidden(submitButton);
        makeObjectVisible(screenshotButton);
        makeObjectVisible(orText);
        removeImageChanges();
        fileSelector.value = '';
    }
    function resetPopupFromScreenshotInProgress() {
        screenshotInProgress = false;
        showFlexContainer(optionButtonContainer);
        showFlexContainer(otherButtonContainer);
        showFlexContainer(textContainer);
        forceExtensionHeight(ogHeight);
    }
    function resetPopupFromScreenhotTaken() {
        screenshotTaken = false;
        showFlexContainer(optionButtonContainer);
        makeObjectHidden(submitButton);
        makeObjectVisible(orText);
        makeObjectVisible(uploadButton);
        removeImageChanges();
    }
    function setDisabledForButtons(isDisabled) {
        submitButton.disabled = isDisabled;
        cancelFileButton.disabled = isDisabled;
        if (screenshotTaken) {screenshotButton.disabled = isDisabled;}
        else if (fileChosen) {uploadButton.disabled = isDisabled;}
        else {console.error("This shouldn't be possible!");}
    }
    async function imageDataToJSONText() {
        // access google gemini in the backend
        const url = "http://localhost:3000";
        const message = {
            fileType: fileType,
            imageData: base64ImgData
        };
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json' // Set the content type header
            },
            body: JSON.stringify(message)
        });
        if (!response.ok) {throw new Error(`Response status: ${response.status}`);}

        const result = await response.json();
        console.log(result);
        console.log(result.message);
        return result.message;
    }
    async function addEventsToCalendar(jsonString) {
        // put the resulting json 
        chrome.identity.getAuthToken({ interactive: true }, async function(token) {
            if (chrome.runtime.lastError) {throw Error(chrome.runtime.lastError);}
        
            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: jsonString
            });
        
            const result = await response.json();
            console.log('Event created:', result.htmlLink);
        });
    }
    async function executeCalls() {
        try {
            const eventsJsonStr = await imageDataToJSONText();
            await addEventsToCalendar('{"start": {date: "2026-03-01"}, "end": {"date": "2026-03-02"}, "summary": "Thing!"}'); //change param to eventsJsonStr when imageDataToJSONText() is good
        }
        catch (error) {console.error(error.message);}
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
        showFlexContainer(fileSelectorContent);
        if (!screenshotTaken) {
            makeObjectVisible(screenshotGif);
            setFileSelectedText("No Screenshot Taken");
        }
    };
    screenshotButton.onmouseleave = function () {
        makeObjectHidden(screenshotGif);
        if (!screenshotInProgress && !screenshotTaken) {
            makeObjectVisible(orText);
            makeObjectVisible(uploadButton);
            hideFlexContainer(fileSelectorContent);
            forceExtensionHeight(ogHeight);
            setFileSelectedText("");
        }
    };
    screenshotButton.onclick = async function () {
        // adjust the extension itself to be smaller to not get in the way of the screenshot
        screenshotInProgress = true;
        makeObjectHidden(selectedFileImage);
        makeObjectHidden(submitButton);

        setTimeout(() => { // time delay to reduce very awkard, abrupt shrinking and growing
            if (screenshotInProgress) {
                const minNeededHeight = fileSelectorContent.clientHeight;
                setFileSelectedText("Screenshot In Progress");
                hideFlexContainer(optionButtonContainer);
                hideFlexContainer(otherButtonContainer);
                hideFlexContainer(textContainer);
                makeObjectVisible(cancelFileButton);
                forceExtensionHeight(minNeededHeight + "px");
            }
        }, 100);

        //take screenshot
        await chrome.tabs.captureVisibleTab(null, { format: 'png' }).then(
            function (dataURL) {
                fileType = "image/png"
                base64ImgData = dataURL.split(",")[1];
                addImageChanges(dataURL);
            },
            function (error) {console.error(error);}
        );

        screenshotInProgress = false;
        screenshotTaken = true;
        setFileSelectedText("Screenshot Taken");
        makeObjectHidden(screenshotGif);
        showFlexContainer(optionButtonContainer);
        showFlexContainer(otherButtonContainer);
        showFlexContainer(textContainer);
        makeObjectVisible(cancelFileButton);
        makeObjectVisible(selectedFileImage);
        makeObjectVisible(submitButton);
        forceExtensionHeight(ogHeight);
    };
    uploadButton.onmouseover = function () {
        makeObjectHidden(screenshotButton);
        makeObjectHidden(orText);
        showFlexContainer(fileSelectorContent);
        if (!fileChosen) {
            makeObjectVisible(uploadGif);
            setFileSelectedText("No File Selected");
        }
    };
    uploadButton.onmouseleave = function () {
        makeObjectHidden(uploadGif);
        if (!fileChosen) {
            makeObjectVisible(screenshotButton);
            makeObjectVisible(orText);
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
                    addImageChanges(reader.result);
                };
            }

            if (!fileChosen) {
                fileChosen = true;
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

        if (fileChosen) {resetPopupFromFileUpload();}
        else if (screenshotInProgress) {resetPopupFromScreenshotInProgress();}
        else if (screenshotTaken) {resetPopupFromScreenhotTaken();}
        else {console.error("This button shouldn't be visible, let alone clickable, at this very moment. ERROR!");}
    };
    submitButton.onclick = async function () {
        setDisabledForButtons(true);
        
        let receivedData = false;
        let coverSet = false;
        const cover = document.createElement("div");
        document.body.appendChild(cover);

        setTimeout(() => {
            if (!receivedData) {
                cover.style.width = "100%";
                cover.style.height = "100%";
                cover.style.position = "absolute";
                cover.style.display = "flex";
                cover.style.justifyContent = "center";
                cover.style.alignItems = "center";
                cover.style.zIndex = "1000";
                cover.style.backgroundColor = "rgba(128, 128, 128, 0.25)";

                const loadingAnimation = document.createElement("h1");
                loadingAnimation.textContent = "Loading...";

                cover.appendChild(loadingAnimation);
                coverSet = true;
            }
        }, 100);
        
        await executeCalls();

        receivedData = true;
        if (coverSet) {document.body.removeChild(cover);}

        setDisabledForButtons(false);

        // return to the original popup setup
        setFileSelectedText("");
        makeObjectHidden(cancelFileButton);
        if (fileChosen) {resetPopupFromFileUpload();}
        else if (screenshotTaken) {resetPopupFromScreenhotTaken();}
        else {console.error("This button shouldn't be visible, let alone clickable, at this very moment. ERROR!");}
    };
}
function allItemsPresent(items) {
    let result = true;
    for (let item of items) {
        result && (result = item !== null);
        if (!result) {
            console.error("Not all DOM elements have been initalized as of the running of this script. Please refresh this Chrome Extension and try again.");
            break;
        }
    }
    return result;
}
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
init();
