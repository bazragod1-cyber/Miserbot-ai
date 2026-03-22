import TelegramBot from "node-telegram-bot-api";

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", (msg) => {
  bot.sendMessage(msg.chat.id, "👑 Miserbot v4 is alive, Your Highness.");
});

console.log("Miserbot v4 is running...");
