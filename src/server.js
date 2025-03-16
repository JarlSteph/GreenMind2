// filepath: /path/to/server.js
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/chat', (req, res) => {
  // Your chat handling logic
  const { message } = req.body;
  // Return a response to the frontend
  res.json({ reply: `You said: ${message}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

