import { GoogleGenAI } from '@google/genai';
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json({limit: 20000010})); // max size of 20mb + 10bytes (20mb max image size for gemini + longest file type str being 10 bytes long)
// Enable CORS
app.use(cors());

app.post('/', async (req, res) => {
  function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

  const body = req.body;
  if (body) {
    const result = await imageDataIntoCalendarJson(body.fileType, body.imageData);
    await sleep(300); // time buffer to prevent loading screen from immediately blinking in and out
    res.status(200).json({ message: result });
  }
  else {res.status(400).json({ message: 'WRONG!!!' });}
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

async function imageDataIntoCalendarJson(fileType, base64ImgData) {
  const ai = new GoogleGenAI({});
  const prompt = 
  `Determine if there are any events in the provided image and format the results in a JSON array filled with JSON objects called events akin to the request bodies of the Event resource from the Google Calendar API.
  Each event be its own JSON object, at least containing key-value pairs for "start" and "end" as provided below:
  
  {
    "start": {},
    "end": {}
  }
  

  Include as many optional properties within the as needed to represent the event(s) accurately.
  If no events can be derived, return an empty JSON array.`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
      {
        inlineData: {
          mimeType: fileType,
          data: base64ImgData,
        },
      },
      { text: prompt}
    ],
    generationConfig: {
      "temperature": 0,
      "topP": 0,
      "topK": 1,
    }
  });
  
  return result.text;
}

async function calendarJsonIntoEvent(jsonText, calendarId) {
  try {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json' // Set the content type header
        },
        body: jsonText
    });
    if (!response.ok) {throw new Error(`Response status: ${response.status}`);}

    const result = await response.json();
    console.log(result);
} catch (error) {console.error(error.message);}
}
