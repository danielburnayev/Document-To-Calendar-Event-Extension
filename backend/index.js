import { GoogleGenAI } from '@google/genai';
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json({limit: '19mb'}));
// Enable CORS
app.use(cors());

app.post('/', async (req, res) => {
  const body = req.body;
  if (body) {
    await processRawData(body.fileType, body.imageData);

    res.status(200).json({ message: 'Hi!' });
  }
  else {
    res.status(400).json({ message: 'WRONG!!!' });
  }
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
    { text: "Determine if there are any events in the provided image and record any times, dates, and descriptions relating to them. Generate any results into a single JSON string." }
  ],
  });
  console.log("The result: " + result.text);
}
