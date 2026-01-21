import { GoogleGenAI } from '@google/genai';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = 3000;
const jsonByteLimit = 20000010;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.use(express.json({limit: jsonByteLimit})); // max size of 20mb + 10bytes (20mb max image size for gemini + longest file type str being 10 bytes long)
app.use(cors());

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

app.post('/', async (req, res) => {
  const body = req.body;

  try {
    const resultJSONText = await imageDataIntoCalendarJson(body.fileType, body.imageData);
    const events = JSON.parse(resultJSONText);
    console.log(events);

    res.status(200).json({ message: resultJSONText });
  }
  catch (error) {
    res.status(400).json({ "err_name": error.name, "err_msg": error.message });
  }
});

//WORK ON THE PROMPT
async function imageDataIntoCalendarJson(fileType, base64ImgData) {
  const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});
  const prompt = 
  `Determine if there are any events in the provided image and format the results in a JSON string containing one JSON array filled with JSON objects called events that are the request bodies of the Event resource from the Google Calendar API.
  Each event be its own JSON object, at least containing key-value pairs for "start" and "end" as provided below:
  
  {
    "start": {},
    "end": {}
  }
  
  Include as many optional yet necessary properties within the as needed to represent the event(s) accurately.
  Do not add additional characters that would prettyprint the JSON string.`;

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
