import { GoogleGenAI } from '@google/genai';
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;
const jsonByteLimit = 20000010;

app.use(express.json({limit: jsonByteLimit})); // max size of 20mb + 10bytes (20mb max image size for gemini + longest file type str being 10 bytes long)
app.use(cors());

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

app.post('/', async (req, res) => {
  const body = req.body;

  try {
    const resultJSONText = await imageDataIntoCalendarJson(body.fileType, body.imageData);
    res.status(200).json({ message: resultJSONText });
  }
  catch (error) {
    res.status(400).json({ "err_name": error.name, "err_msg": error.message });
  }
});

async function imageDataIntoCalendarJson(fileType, base64ImgData) {
  const ai = new GoogleGenAI({});
  const prompt = 
  `Determine if there are any events in the provided image and format the results in a string containing one array filled with JSON objects called events that are the request bodies of the Event resource from the Google Calendar API.
  Each event must be its own JSON object, containing string-JSON object pairs for "start" and "end", and string-string pair "summary" as provided below. 
  Ensure the JSON objects for "start" and "end" have a "date" or "dateTime" field depending on whether a time can be determined for the event, and a "timeZone" field. 
  If a time and date are provided for an event but the specific start and/or end times cannot be confidently determined, use "date" instead of "dateTime" for the event and have the date of the event be the date provided, with no time included in the event. 
  If a time zone cannot be confidently determined, have the time zone be "America/New_York".
  Ensure the string for "summary" is directly copied from the provided image to represent what the event is for.

  Do not include events where dates for either "start" and "end" are not able to be determined.
  Do not include any more properties aside from those previously mentioned and reminders. The format for the reminders property is given in the event JSON object provided and shouldn't be changed.
  
  {
    "start": {},
    "end": {},
    "summary": "",
    "reminders": {
      "useDefault": false,
      "overrides": [
        {"method": "email", "minutes": 10080},
        {"method": "popup", "minutes": 10080},
        {"method": "email", "minutes": 1440},
        {"method": "popup", "minutes": 1440}
      ]
    }
  }

  The string result should be an array consisting of these events if events can be identified. If they cannot have the string be: "[]".`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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

  return result.text.substring(result.text.indexOf("["), result.text.lastIndexOf("]") + 1);
}
