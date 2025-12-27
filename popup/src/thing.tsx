function init(): void {
    const screenshotButton: HTMLButtonElement | null = document.getElementById("screenshot-btn") as HTMLButtonElement;
    const orText: HTMLElement | null = document.getElementById("or-text");
    const uploadButton: HTMLButtonElement | null = document.getElementById("upload-btn") as HTMLButtonElement;
    const fileSelector: HTMLInputElement | null = document.getElementById("actual-file-selector") as HTMLInputElement;
    const fileSelectorContent: HTMLElement | null = document.getElementById("selected-file-stuff");
    const submitButton: HTMLInputElement | null = document.getElementById("submit-btn") as HTMLInputElement;
    const cancelFileButton: HTMLButtonElement | null = document.getElementById("cancel-file-btn") as HTMLButtonElement;

    let chosen: boolean = false;

    function hideFileSelectorContent(): void {
        fileSelectorContent.classList.add("hidden-stuff");
        fileSelectorContent.removeAttribute("style");
    }

    function showFileSelectorContent(): void {
        fileSelectorContent.classList.remove("hidden-stuff");
        fileSelectorContent.style.display = "flex";
    }

    if (!allItemsPresent([uploadButton, fileSelector, fileSelectorContent, submitButton, cancelFileButton])) {return;}

    uploadButton.onmouseover = () => {
        screenshotButton.style.visibility = "hidden";
        orText.style.visibility = "hidden";
        showFileSelectorContent();
    };
    uploadButton.onmouseleave = () => {
        if (!chosen) {
            screenshotButton.removeAttribute("style");
            orText.removeAttribute("style");
            hideFileSelectorContent();
        }
    };
    uploadButton.onclick = () => {fileSelector.click();};

    fileSelector.onchange = () => {
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

    cancelFileButton.onclick = () => {
        fileSelectorContent.children[0].textContent = "No File Selected";
        chosen = false;
        hideFileSelectorContent()
        submitButton.classList.add("hidden-stuff");
        cancelFileButton.removeAttribute("style");
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
