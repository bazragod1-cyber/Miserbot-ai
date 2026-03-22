const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

let openai;

try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (e) {
  console.log("OpenAI init failed");
}

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

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are Miserbot, a royal palace advisor. You ALWAYS address the user as 'Your Highness'. You speak with elegance, intelligence, and calm authority. Never be casual. Never say generic phrases like 'How can I assist you today?'. Keep responses refined, slightly poetic, and helpful. Occasionally include a short quote when appropriate.",
        },
        ...memory[chatId].slice(-6),
      ],
    });

    const reply = response.output_text || "Your command is received, Your Highness.";

    memory[chatId].push({ role: "assistant", content: reply });

    bot.sendMessage(chatId, reply);

  } catch (err) {
    console.log("AI error:", err.message);

    // CLEAN fallback (still royal, no spam)
    bot.sendMessage(chatId, "The court humbly requests a moment, Your Highness.");
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("Royal Palace running on port " + PORT);
});
