import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import express from "express";

// ENV
const bot = new TelegramBot(process.env.BOT_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MEMORY STORE (simple for now)
const memory = {};

// WEBHOOK
const url = process.env.RENDER_EXTERNAL_URL;
bot.setWebHook(`${url}/bot${process.env.BOT_TOKEN}`);

// EXPRESS
const app = express();
app.use(express.json());

// TELEGRAM ENDPOINT
app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// HOME
app.get("/", (req, res) => {
  res.send("Miserbot Elite is running 🚀");
});

// START COMMAND
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👁 Welcome to Miserbot.\nYour personal AI assistant.\n\nTell me something about yourself... I'll remember."
  );
});

// MAIN HANDLER
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  // INIT MEMORY
  if (!memory[chatId]) memory[chatId] = {};

  const userMemory = memory[chatId];

  try {
    // 🧠 SAVE MEMORY
    if (text.toLowerCase().startsWith("remember ")) {
      const data = text.replace("remember ", "");
      userMemory.note = data;

      return bot.sendMessage(chatId, `🧠 Saved: "${data}"`);
    }

    // 🧠 RECALL MEMORY
    if (text.toLowerCase().includes("what do you know about me")) {
      if (!userMemory.note) {
        return bot.sendMessage(chatId, "I don’t know anything yet.");
      }

      return bot.sendMessage(chatId, `Here’s what I know:\n- ${userMemory.note}`);
    }

    // 🧠 CLEAR MEMORY
    if (text.toLowerCase() === "clear memory") {
      memory[chatId] = {};
      return bot.sendMessage(chatId, "Memory wiped.");
    }

    // ⏰ REAL TIME
    const now = new Date().toLocaleString();

    // 🤖 AI RESPONSE
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Miserbot — an elite AI assistant created by your owner.

Rules:
- Never say you are created by OpenAI
- Speak confidently and intelligently
- Be slightly mysterious, but helpful
- Keep responses clean and direct
- Current real time: ${now}
          `,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const reply = response.choices[0].message.content;

    bot.sendMessage(chatId, reply);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "⚠️ Error occurred.");
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Miserbot running...");
});
