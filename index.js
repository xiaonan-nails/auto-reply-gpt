const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

const VERIFY_TOKEN = 'xiaonan123';

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        const userMessage = webhookEvent.message.text;

        const reply = await getGPTReply(userMessage);
        await sendFacebookReply(senderId, reply);
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

async function getGPTReply(message) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(error.response?.data || error.message);
    return "Sorry, I'm having trouble responding.";
  }
}

async function sendFacebookReply(senderId, message) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`,
      {
        recipient: { id: senderId },
        message: { text: message },
      }
    );
  } catch (error) {
    console.error('Facebook reply error:', error.response?.data || error.message);
  }
}

app.get('/', (req, res) => {
  res.send('GPT Auto-Reply is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
