import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

// Telegram bot setup
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Bot response logic
bot.on("message", async (msg) => {

  const chatId = msg.chat.id;
  const text = msg.text;

  try {

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: text,
      max_output_tokens: 120
    });

    const reply = response.output_text;

    bot.sendMessage(chatId, reply);

  } catch (error) {

    bot.sendMessage(chatId, "⚠️ MiserBot is sleeping to save tokens. Try again soon.");

  }

});

console.log("MiserBot AI Running...");
