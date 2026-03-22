const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const app = express();

// ENV
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.BOT_TOKEN;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});

// Telegram bot
const bot = new TelegramBot(TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
  },
});

// Start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Miserbot AI is online 🤖");
});

// AI response
bot.on("message", async (msg) => {
  if (!msg.text || msg.text === "/start") return;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: msg.text },
      ],
    });

    const reply = response.choices[0].message.content;

    bot.sendMessage(msg.chat.id, reply);
  } catch (err) {
    console.error(err);
    bot.sendMessage(msg.chat.id, "AI error. Check API key.");
  }
});

// Health route (Railway)
app.get("/", (req, res) => {
  res.send("Miserbot AI running 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
