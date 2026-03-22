const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;
const token = process.env.BOT_TOKEN;

// Start bot
const bot = new TelegramBot(token, { polling: true });

// OpenAI setup (SAFE)
let openai = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log("AI initialized");
  } else {
    console.log("No OpenAI key found");
  }
} catch (err) {
  console.log("AI init failed:", err.message);
}

// Keep Railway alive
app.get("/", (req, res) => {
  res.send("Miserbot Phase 2 🚀");
});

// /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Miserbot Phase 2 active 🤖");
});

// Message handler
bot.on("message", async (msg) => {
  if (!msg.text || msg.text === "/start") return;

  const chatId = msg.chat.id;

  // Default fallback reply
  let reply = "You said: " + msg.text;

  // Try AI (SAFE)
  if (openai) {
    try {
      const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: msg.text,
      });

      if (response.output_text) {
        reply = response.output_text;
      }
    } catch (err) {
      console.log("AI runtime error:", err.message);
    }
  }

  // ALWAYS send a reply (never crashes)
  bot.sendMessage(chatId, reply);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
