const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const app = express();

// Railway port
const PORT = process.env.PORT || 3000;

// Tokens
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Telegram message handler
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Ignore empty messages
  if (!userMessage) return;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userMessage }],
    });

    const reply = response.choices[0].message.content;

    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Error talking to AI 🤖");
  }
});

// Health check route
app.get("/", (req, res) => {
  res.send("Miserbot is alive 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
