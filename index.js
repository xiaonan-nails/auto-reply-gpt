const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).send("Missing user message.");
    }

    const gptResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful customer service assistant." },
          { role: "user", content: userMessage },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const reply = gptResponse.data.choices[0].message.content.trim();
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.status(500).send("Something went wrong.");
  }
});

app.get("/", (req, res) => {
  res.send("GPT-4o Webhook is running.");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
