function init() {
    function makeObjectHidden(obj: HTMLElement | null): void {
        obj!.classList.add("hidden-stuff");
    }

    function makeObjectVisible(obj: HTMLElement | null): void {
        obj!.classList.remove("hidden-stuff");
    }

    function hideFlexContainer(obj: HTMLElement | null): void {
        obj!.style.display = "none";
    }

    function showFlexContainer(obj: HTMLElement | null): void {
        obj!.style.display = "flex";
    }

    function setFileSelectedText(text: string): void {
        fileSelectedText!.textContent = text;
    }

    function forceExtensionHeight(newHeight: string): void {
        theHTMLElement!.style.height = newHeight;
    }

    function changeCSSVariableValue(cssVariableName: string, newValue: string): void {
        document.documentElement.style.setProperty(cssVariableName, newValue);
    }

    const ogHeight: string = document.body.clientHeight + "px";
    const theHTMLElement : HTMLElement | null = document.querySelector('html');
    const screenshotButton: HTMLButtonElement | null = document.getElementById("screenshot-btn") as HTMLButtonElement;
    const screenshotGif: HTMLElement | null = document.getElementById("screenshot-gif");
    const orText: HTMLParagraphElement | null = document.getElementById("or-text") as HTMLParagraphElement;
    const uploadGif: HTMLElement | null = document.getElementById("upload-gif");
    const uploadButton: HTMLButtonElement | null = document.getElementById("upload-btn") as HTMLButtonElement;
    const fileSelector: HTMLInputElement | null = document.getElementById("actual-file-selector") as HTMLInputElement;
    const fileSelectorContent: HTMLElement | null = document.getElementById("selected-file-stuff");
    const fileSelectedText: HTMLParagraphElement | null= document.getElementById("file-selected-text") as HTMLParagraphElement;
    const cancelFileButton: HTMLButtonElement | null = document.getElementById("cancel-file-btn") as HTMLButtonElement;
    const submitButton: HTMLInputElement | null = document.getElementById("submit-btn") as HTMLInputElement;
    const optionButtonContainer: HTMLElement | null = document.getElementById("option-btn-container");
    const otherButtonContainer: HTMLElement | null = document.getElementById("other-btn-container");
    const textContainer: HTMLElement | null = document.getElementById("text-container");

    let fileChosen: boolean = false;
    let screenshotTaken: boolean = false;
    let screenshotInProgress: boolean = false;
    let currTabs = null;

    // does the null checking for us ahead of time
    if (!allItemsPresent([theHTMLElement, uploadButton, fileSelector, fileSelectorContent, submitButton, fileSelectedText, cancelFileButton, 
                          screenshotButton, orText, uploadGif, optionButtonContainer, otherButtonContainer, textContainer])) {
        return;
    }

    forceExtensionHeight(ogHeight);

    screenshotButton.onmouseover = function () {
        makeObjectHidden(orText);
        makeObjectHidden(uploadButton);
        makeObjectVisible(screenshotGif);
        showFlexContainer(fileSelectorContent);
        if (!screenshotTaken) {setFileSelectedText("No Screenshot Taken");}
    };
    screenshotButton.onmouseleave = function () {
        makeObjectVisible(orText);
        makeObjectVisible(uploadButton);
        makeObjectHidden(screenshotGif);
        if (!screenshotInProgress) {
            hideFlexContainer(fileSelectorContent);
            forceExtensionHeight(ogHeight);
        }
        setFileSelectedText((screenshotInProgress) ? "Screenshot In Progress" : (screenshotTaken) ? "Screenshot Taken" : "");
    };
    screenshotButton.onclick = async function () {
        let queryOptions = { active: true, currentWindow: true, lastFocusedWindow: true};
        currTabs = await chrome.tabs.query(queryOptions);

        if (currTabs) {
            console.log("Active Tab Object:", currTabs[0]);
        } else {
            console.error("No active tab found.");
        }
        
        screenshotInProgress = true;
        hideFlexContainer(optionButtonContainer);
        hideFlexContainer(otherButtonContainer);
        hideFlexContainer(textContainer);

        const minNeededHeight = fileSelectorContent!.clientHeight;
        makeObjectVisible(cancelFileButton);
        forceExtensionHeight(minNeededHeight + "px");
    };

    uploadButton.onmouseover = function () {
        makeObjectHidden(screenshotButton);
        makeObjectHidden(orText);
        makeObjectVisible(uploadGif);
        showFlexContainer(fileSelectorContent);
        if (!fileChosen) {setFileSelectedText("No File Selected");}
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
    uploadButton.onclick = function () {fileSelector.click();};

    fileSelector.onchange = function () {
        if (fileSelector.files && fileSelector.files.length == 1) {
            setFileSelectedText(fileSelector.files[0].name);

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
        if (fileChosen) {
            fileChosen = false;
            setFileSelectedText("");
            makeObjectHidden(uploadGif);
            hideFlexContainer(fileSelectorContent);
            makeObjectHidden(submitButton);
            makeObjectHidden(cancelFileButton);
            makeObjectVisible(screenshotButton);
            makeObjectVisible(orText);
            fileSelector.value = '';
        }
        else if (screenshotInProgress) {
            screenshotInProgress = false
            setFileSelectedText("");
            showFlexContainer(optionButtonContainer);
            showFlexContainer(otherButtonContainer);
            showFlexContainer(textContainer);
            makeObjectHidden(cancelFileButton);
            forceExtensionHeight(ogHeight);
        }
        else if (screenshotTaken) {
            
        }
        else {
            console.error("This button shouldn't be visible, let alone clickable, at this very moment. ERROR!");
        }
    };

    submitButton.onclick = function () {
        const reader: FileReader = new FileReader();
        if (fileSelector!.files && fileSelector!.files[0]) {
            reader.readAsDataURL(fileSelector.files[0]);

            reader.onloadend = function () {
                const fileType: string = fileSelector!.files![0].type;
                const base64ImgData: string = (reader.result as string).split(",")[1];
            };
        }
    };
}

function allItemsPresent(items: (HTMLElement | null)[]): boolean {
    let result: boolean = true;
    for (let item of items) {
        result &&= item !== null;
        if (!result) {
            console.log("Not all DOM elements have been initalized as of the running of this script. Please refresh this Chrome Extension and try again.");
            break;
        }
    }

    return result;
}

init();
