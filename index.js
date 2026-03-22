const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

let openai = null;

// Safe OpenAI init
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("AI ready");
  }
} catch (err) {
  console.log("AI init failed:", err.message);
}

// Memory (per user)
const memory = {};

// Keep Railway alive
app.get("/", (req, res) => {
  res.send("Miserbot Palace 👑");
});

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome, Your Highness 👑 The palace awaits your command.");
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text === "/start") return;

  if (!memory[chatId]) {
    memory[chatId] = [];
  }

  memory[chatId].push({ role: "user", content: text });

  let reply = "As you wish, Your Highness.";

  // SAFE AI attempt
  if (openai) {
    try {
      const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are Miserbot, a royal palace advisor. You ALWAYS address the user as 'Your Highness'. You speak with elegance, clarity, and authority. You are calm, intelligent, and respectful. You occasionally include refined, short quotes or wisdom. Never break character. Never speak casually.",
          },
          ...memory[chatId].slice(-6),
        ],
      });

      if (response.output_text) {
        reply = response.output_text;
      }
    } catch (err) {
      console.log("AI runtime error:", err.message);
    }
  }

  memory[chatId].push({ role: "assistant", content: reply });

  bot.sendMessage(chatId, reply);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("Royal Palace running on port " + PORT);
});
