# Document to Calendar Event Extension (Local Configuration)
By: Daniel Burnayev

A Chrome Extension pop-up that allows one to submit an image file or screenshot of their tab, and have events determined and added/inserted into one's Google Calendar. This project is still a work in progress and doesn't have a fully released version ready for usage beyond local environments.

This was made so that people can still access and use the Chrome Extension on their own local machine/device before an official Chrome Extension comes out in the Chrome Extension Store (if I ever decide to do that). Only difference is that some technical setup will need to be done in order to get it up and running on a local machine, hence the instructions below.

## Required Technologies:
* npm (10.9.2), for package installations and running necessary methods
* node (v22.14.0), for executing the backend locally
* vite (7.3.0), for package rollup and script running
* A Google Account
* A local Gemini API key (labeled GEMINI_API_KEY in your machine's environment variables)

## Usage:
1. Clone this repository into your local machine
   ``` git clone https://github.com/danielburnayev/Document-To-Calendar-Event-Extension.git ```
2. Change directories into the new repo and checkout the local branch, the branch you'll use to get a local version of your Chrome Extension
   ``` cd Document-To-Calendar-Event-Extension; git checkout local ```
3. Change directories to the backend directory
   ``` cd backend ```
4. Install the @google/genai npm package
   ``` npm install @google/genai ```
5. Set up a local backend
   ``` node index.js ```
7. In another terminal, manuver back to the Document-To-Calendar-Event-Extension directory and move to the document-to-calendar-event directory (the front-end)
   ``` cd ../document-to-calendar-event ```
8. Install the @types/chrome npm package
   ``` npm install @types/chrome ```
9. Create a folder named "dist" with relevant files to get the Chrome Extension working
   ``` npm run build ```
10. You now have a folder named "dist" in you current directory. Go over to your Chrome Extensions page [chrome://extensions/], click on the "Load Unpacked" button in the top left corner of the page, and select only the recently created dist folder to be uploaded.
![alt text](https://github.com/danielburnayev/Document-To-Calendar-Event-Extension/blob/local/instr_imgs/upload_unpacked.png "Load Unpacked")
![alt text](https://github.com/danielburnayev/Document-To-Calendar-Event-Extension/blob/local/instr_imgs/select_folder.png "Select dist Folder")
11. With all that done, you should be able to see the new local-based Chrome Extension and use it like so! Have fun letting it make events on your calendar on your behalf when working with really long documents or when you just don't feel like it.
