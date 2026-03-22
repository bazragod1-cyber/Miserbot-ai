const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

// ENV variables
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.BOT_TOKEN;

// Start Telegram bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Simple command
bot.on("message", (msg) => {
  bot.sendMessage(msg.chat.id, "Miserbot is alive 🚀");
});

// Web server (Railway needs this)
app.get("/", (req, res) => {
  res.send("Bot is running 🚀");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
