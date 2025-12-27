function init() {
    function makeObjectHidden(obj: HTMLElement): void {
        obj.classList.add("hidden-stuff");
    }

    function makeObjectVisible(obj: HTMLElement): void {
        obj.classList.remove("hidden-stuff");
    }

    function hideFileSelectorContent(): void {
        makeObjectHidden(fileSelectorContent);
        fileSelectorContent.removeAttribute("style");
    }

    function showFileSelectorContent(): void {
        makeObjectVisible(fileSelectorContent);
        fileSelectorContent.style.display = "flex";
    }

    function setFileSelectedText(text: string): void {
        fileSelectedText.textContent = text;
    }

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

    let fileChosen: boolean = false;
    let screenshotTaken: boolean = false;

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
        if (!fileChosen) {setFileSelectedText("No File Selected");}
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
    uploadButton.onclick = function () {fileSelector.click();};

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

function allItemsPresent(items: HTMLElement[]): boolean {
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
