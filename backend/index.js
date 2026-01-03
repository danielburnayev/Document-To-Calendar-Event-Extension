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
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const body = req.body;
  if (body) {
    const result = await processRawData(body.fileType, body.imageData);
    res.status(200).json({ message: result });
  }
  else {res.status(400).json({ message: 'WRONG!!!' });}
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

async function processRawData(fileType, base64ImgData) {
  const ai = new GoogleGenAI({});
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
      {
        inlineData: {
          mimeType: fileType,
          data: base64ImgData,
        },
      },
      { text: "Determine if there are any events in the provided image and record any times, dates, and descriptions relating to them. \
      Generate any results into a single JSON string. If no events can be derived, return the string of an empty JSON object." }
    ],
    generationConfig: {
      "temperature": 0.01,
      "topP": 0.01,
      "topK": 1,
    }
  });
  return result.text
}
