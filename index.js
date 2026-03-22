const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

const PORT = process.env.PORT || 3000;
const token = process.env.BOT_TOKEN;

// Start bot
const bot = new TelegramBot(token, { polling: true });

// Keep Railway alive
app.get("/", (req, res) => {
  res.send("Miserbot is alive 🚀");
});

// /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Miserbot is alive 🚀");
});

// Reply to messages
bot.on("message", (msg) => {
  if (msg.text !== "/start") {
    bot.sendMessage(msg.chat.id, "You said: " + msg.text);
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
