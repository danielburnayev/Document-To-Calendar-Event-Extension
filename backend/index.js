const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json({limit: '20mb'}));
// Enable CORS
app.use(cors());

app.post('/', (req, res) => {
  const body = req.body;
  if (body) {
    res.status(200).json({ message: 'Hi!' });
  }
  else {
    res.status(400).json({ message: 'WRONG!!!' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
