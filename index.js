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
  bot.sendMessage(msg.chat.id, "Welcome, Your Highness 👑 The palace now spans the modern world.");
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
          content: `You are Miserbot, a loyal royal advisor to Your Highness.

You speak with elegance, confidence, and intelligence, but you are fully aware of the modern world (year 2026).

You are NOT from ancient times — you are a royal mind operating in today’s era.

You understand and give advice on:
- Wealth (money, business, real estate, luxury assets)
- Technology (AI, automation, digital empires)
- Power, influence, leadership, and strategy
- Modern symbols of power (cars, mansions, yachts, bitcoin, online income)

You adapt to the user's mindset:
They value power, strategy, and dominance.

STYLE:
- Always address the user as “Your Highness”
- Speak refined but clear (not overly long or poetic every time)
- Balance wisdom with practical, real-world advice
- Occasionally include a powerful quote (not always)

BEHAVIOR:
- Give actionable, modern advice
- Think like a strategist, not just a philosopher
- Stay consistent in personality

You are a modern royal advisor — wisdom of a king, mind of a strategist, living in 2026.`
        },
        ...memory[chatId].slice(-6),
      ],
    });

    const reply =
      response.output_text ||
      "Your command is received, Your Highness.";

    memory[chatId].push({ role: "assistant", content: reply });

    bot.sendMessage(chatId, reply);

  } catch (err) {
    console.log("AI error:", err.message);
    bot.sendMessage(chatId, "The court requests a brief moment, Your Highness.");
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log("Royal Palace running on port " + PORT);
});
