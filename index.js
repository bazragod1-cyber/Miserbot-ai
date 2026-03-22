const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// 🔑 This is where Railway injects your key
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test route (open in browser)
app.get("/", (req, res) => {
  res.send("Miserbot is alive 🚀");
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: message }
      ],
    });

    res.json({
      reply: response.choices[0].message.content,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something broke" });
  }
});

// 🚨 REQUIRED for Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
