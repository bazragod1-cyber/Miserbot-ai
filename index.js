const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Keep Railway alive
app.get("/", (req, res) => {
  res.send("Miserbot AI is running 🚀");
});

// /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Miserbot AI is online 🤖");
});

// AI response (FIXED)
bot.on("message", async (msg) => {
  if (!msg.text || msg.text === "/start") return;

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: msg.text,
    });

    const reply = response.output_text;

    bot.sendMessage(msg.chat.id, reply || "No response.");
  } catch (error) {
    console.error("AI ERROR:", error.message);
    bot.sendMessage(msg.chat.id, "AI error 🤖");
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
