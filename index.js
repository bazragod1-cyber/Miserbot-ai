import TelegramBot from "node-telegram-bot-api";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// Web server (required for Render free tier)
app.get("/", (req, res) => {
  res.send("👑 Miserbot v4 is alive");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

bot.on("message", (msg) => {
  bot.sendMessage(msg.chat.id, "👑 Miserbot v4 is alive, Your Highness.");
});
