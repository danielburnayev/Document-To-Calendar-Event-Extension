class NoEventsError extends Error {
    constructor() {
        super("Document provided has no identifiable events.");
        this.name = 'NoEventsError';
    }
}

class TooBigFileError extends Error {
    constructor() {
        super("Document provided is too big, specifically bigger than the 2MB limit.");
        this.name = 'TooBigFileError';
    }
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
const miscButtonContainer = document.getElementById("misc-btn-container");
const textContainer = document.getElementById("text-container");
const selectedFileImage = document.getElementById("selected-file-image");
const finishLoadPopup = document.getElementById("finish-load-popup");
const eventsForTextbox = document.getElementById("events-for-textbox");
const maxRetries = 5;
const visualTimeBufferMS = 100;
const finishLoadPopupVisibleMS = 1500;
const maxFileByteSize = 2000000;
let controller = new AbortController();
let fileChosen = false;
let screenshotTaken = false;
let screenshotInProgress = false;
let showEventsForTextbox = false;
let fileType;
let base64ImgData;

init();

function init() {
    // does the null checking for us ahead of time
    if (!allItemsPresent([theHTMLElement, uploadButton, fileSelector, fileSelectorContent, submitButton, fileSelectedText, cancelFileButton,
        screenshotButton, orText, uploadGif, optionButtonContainer, miscButtonContainer, textContainer, selectedFileImage, finishLoadPopup,
        eventsForTextbox])) {
        return;
    }
    forceExtensionHeight(theHTMLElement, ogHeight);
    screenshotButton.onmouseover = function () {
        makeObjectHidden(orText);
        makeObjectHidden(uploadButton);
        showFlexContainer(fileSelectorContent);
        if (!screenshotTaken) {
            makeObjectVisible(screenshotGif);
            setSomeText(fileSelectedText, "No Screenshot Taken");
        }
    };
    screenshotButton.onmouseleave = function () {
        makeObjectHidden(screenshotGif);
        if (!screenshotInProgress && !screenshotTaken) {
            makeObjectVisible(orText);
            makeObjectVisible(uploadButton);
            hideFlexContainer(fileSelectorContent);
            forceExtensionHeight(theHTMLElement, ogHeight);
            setSomeText(fileSelectedText, "");
        }
    };
    screenshotButton.onclick = async function () {
        // adjust the extension itself to be smaller to not get in the way of the screenshot
        screenshotInProgress = true;
        makeObjectHidden(selectedFileImage);
        makeObjectHidden(submitButton);
        if (showEventsForTextbox) {
            setDisabledForObj(eventsForTextbox, false);
            makeObjectVisible(eventsForTextbox);
        }

        setTimeout(() => { // time delay to reduce very awkward, abrupt shrinking and growing
            if (screenshotInProgress) {
                const minNeededHeight = fileSelectorContent.clientHeight;
                setSomeText(fileSelectedText, "Screenshot In Progress");
                hideFlexContainer(optionButtonContainer);
                hideFlexContainer(miscButtonContainer);
                hideFlexContainer(textContainer);
                makeObjectVisible(cancelFileButton);
                forceExtensionHeight(theHTMLElement, minNeededHeight + "px");
            }
        }, visualTimeBufferMS);

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
        setSomeText(fileSelectedText, "Screenshot Taken");
        makeObjectHidden(screenshotGif);
        showFlexContainer(optionButtonContainer);
        showFlexContainer(miscButtonContainer);
        showFlexContainer(textContainer);
        makeObjectVisible(cancelFileButton);
        makeObjectVisible(selectedFileImage);
        makeObjectVisible(submitButton);
        forceExtensionHeight(theHTMLElement, ogHeight);
    };
    uploadButton.onmouseover = function () {
        makeObjectHidden(screenshotButton);
        makeObjectHidden(orText);
        showFlexContainer(fileSelectorContent);
        if (!fileChosen) {
            makeObjectVisible(uploadGif);
            setSomeText(fileSelectedText, "No File Selected");
        }
    };
    uploadButton.onmouseleave = function () {
        makeObjectHidden(uploadGif);
        if (!fileChosen) {
            makeObjectVisible(screenshotButton);
            makeObjectVisible(orText);
            hideFlexContainer(fileSelectorContent);
            setSomeText(fileSelectedText, "");
        }
    };
    uploadButton.onclick = function () {fileSelector.click();};
    fileSelector.onchange = function () {
        if (fileSelector.files && fileSelector.files.length == 1 && fileSelector.files[0].size <= maxFileByteSize) {
            if (showEventsForTextbox) {
                setDisabledForObj(eventsForTextbox, false);
                makeObjectVisible(eventsForTextbox);
            }
            setSomeText(fileSelectedText, fileSelector.files[0].name);

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
        else if (fileSelector.files[0].size > maxFileByteSize) {setFinishLoadPopup(new TooBigFileError());}
    };
    cancelFileButton.onclick = function () {
        setSomeText(fileSelectedText, "");
        makeObjectHidden(cancelFileButton);
        if (showEventsForTextbox) {
            setDisabledForObj(eventsForTextbox, true);
            makeObjectHidden(eventsForTextbox);
        }

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
        cover.style.width = "100%";
        cover.style.height = "100%";
        cover.style.zIndex = "1000";
        cover.style.position = "absolute";
        cover.style.display = "flex";
        cover.style.flexDirection = "column";
        cover.style.justifyContent = "center";
        cover.style.alignItems = "center";
        document.body.appendChild(cover);

        setTimeout(() => {
            if (!receivedData) {
                changeBackgroundColor(cover, "rgba(128, 128, 128, 0.25)");

                const loadingAnimation = document.createElement("h1");
                loadingAnimation.id = "loading-cover-text";
                loadingAnimation.style.marginBottom = "2.5px";
                loadingAnimation.style.padding = "2.5px";
                setSomeText(loadingAnimation, "Analyzing Image...");
                changeBackgroundColor(loadingAnimation, "white");

                const cancelLoadButton = document.createElement("button");
                cancelLoadButton.classList.add("cancel-btn");
                setSomeText(cancelLoadButton, "X");
                cancelLoadButton.onclick = function () {
                    controller.abort();
                    controller = new AbortController();
                };

                cover.appendChild(loadingAnimation);
                cover.appendChild(cancelLoadButton);

                coverSet = true;
            }
        }, visualTimeBufferMS);
        
        const error = await executeCalls();

        receivedData = true;
        if (coverSet) {document.body.removeChild(cover);}

        setDisabledForButtons(false);

        // return to the original popup setup
        setSomeText(fileSelectedText, "");
        makeObjectHidden(cancelFileButton);
        if (fileChosen) {resetPopupFromFileUpload();}
        else if (screenshotTaken) {resetPopupFromScreenhotTaken();}
        else {console.error("This button shouldn't be visible, let alone clickable, at this very moment. ERROR!");}

        //temporary popup 
        setFinishLoadPopup(error);
    };
}
function setFinishLoadPopup(error) {
    if (error) {
        let errorText = "Unexpected Error. Try again later.";
        if (error.name == "AbortError") {errorText = "Process Aborted";}
        else if (error.name == "NoEventsError") {errorText = "Image With No Events";}
        else if (error.name == "TooBigFileError") {errorText = "Provide Documents <= 2MB";}

        changeBackgroundColor(finishLoadPopup, "red");
        setSomeText(finishLoadPopup, errorText);
    }
    else {
        changeBackgroundColor(finishLoadPopup, "greenyellow");
        setSomeText(finishLoadPopup, "Processed Events");
    }
    makeObjectVisible(finishLoadPopup);
    setTimeout(() => {
        makeObjectHidden(finishLoadPopup);
    }, finishLoadPopupVisibleMS);
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
function setSomeText(obj, text) {
    obj.textContent = text;
}
function forceExtensionHeight(obj, newHeight) {
    obj.style.height = newHeight;
}
function changeBackgroundColor(obj, theColor) {
    obj.style.backgroundColor = theColor;
}
function turnInputBlack(obj) {
    obj.value = "";
}
function setDisabledForObj(obj, isDisabled) {
    obj.disabled = isDisabled;
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
    turnInputBlack(fileSelector);
    if (showEventsForTextbox) {
        setDisabledForObj(eventsForTextbox, true);
        makeObjectHidden(eventsForTextbox);
    }
}
function resetPopupFromScreenshotInProgress() {
    screenshotInProgress = false;
    showFlexContainer(optionButtonContainer);
    showFlexContainer(miscButtonContainer);
    showFlexContainer(textContainer);
    forceExtensionHeight(theHTMLElement, ogHeight);
    if (showEventsForTextbox) {
        setDisabledForObj(eventsForTextbox, true);
        makeObjectHidden(eventsForTextbox);
    }
}
function resetPopupFromScreenhotTaken() {
    screenshotTaken = false;
    showFlexContainer(optionButtonContainer);
    makeObjectHidden(submitButton);
    makeObjectVisible(orText);
    makeObjectVisible(uploadButton);
    removeImageChanges();
    if (showEventsForTextbox) {
        setDisabledForObj(eventsForTextbox, true);
        makeObjectHidden(eventsForTextbox);
    }
}
function setDisabledForButtons(isDisabled) {
    setDisabledForObj(submitButton, isDisabled);
    setDisabledForObj(cancelFileButton, isDisabled);
    if (screenshotTaken) {setDisabledForObj(screenshotButton, isDisabled);}
    else if (fileChosen) {setDisabledForObj(uploadButton, isDisabled);}
    else {console.error("This shouldn't be possible!");}
}
async function imageDataToObject() {
    // access google gemini in the backend
    const url = "http://localhost:3000";
    const message = {
        fileType: fileType,
        imageData: base64ImgData,
        eventsAreForThis: eventsForTextbox.value
    };
    turnInputBlack(eventsForTextbox);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json' // Set the content type header
        },
        signal: controller.signal,
        body: JSON.stringify(message)
    });
    if (!response.ok) {throw new Error(`Response status: ${response.status}`);}

    const result = await response.json();
    const jsonEvents = JSON.parse(result.message);
    return jsonEvents;
}
async function addEventToCalendar(jsonString) {
    function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

    const calendarAPIResult = await chrome.identity.getAuthToken({ interactive: true });
    const token = calendarAPIResult.token;

    if (chrome.runtime.lastError) {throw Error(chrome.runtime.lastError);}

    let response;
    let retryCount = 0;
    let waitTimeMS = 500;

    do {
        if (retryCount > 0) {await sleep(waitTimeMS);}

        response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal,
            body: jsonString
        });

        retryCount++;
        waitTimeMS *= 2;
    }
    while (retryCount < maxRetries && (response.status == 403 || response.status == 429));
}
async function executeCalls() {
    try {
        const events = await imageDataToObject();
        if (events.length == 0) {throw new NoEventsError();}

        const loadingCoverText = document.getElementById("loading-cover-text");
        if (allItemsPresent([loadingCoverText])) {setSomeText(loadingCoverText, "Adding Events...");}

        for (const event of events) {await addEventToCalendar(JSON.stringify(event));}

        return null;
    }
    catch (error) {
        console.error(error);
        return error;
    }
}
