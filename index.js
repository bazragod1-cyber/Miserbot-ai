import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import express from "express";

// ENV
const bot = new TelegramBot(process.env.BOT_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MEMORY
const memory = {};

// WEBHOOK
const url = process.env.RENDER_EXTERNAL_URL;
bot.setWebHook(`${url}/bot${process.env.BOT_TOKEN}`);

// EXPRESS
const app = express();
app.use(express.json());

app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Miserbot Elite running 🚀");
});

// START
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👁 Miserbot online.\nTell me something about yourself… I’ll remember."
  );
});

// MAIN
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  if (!text) return;

  if (!memory[chatId]) {
    memory[chatId] = {};
  }

  const user = memory[chatId];

  try {
    // 🔥 SMART MEMORY DETECTION

    if (text.includes("favorite color")) {
      const color = text.split("is")[1]?.trim();

      if (color) {
        user.favorite_color = color;
        return bot.sendMessage(chatId, `🧠 Noted. Your favorite color is ${color}.`);
      }
    }

    // 🧠 RECALL
    if (text.includes("what") && text.includes("favorite color")) {
      if (user.favorite_color) {
        return bot.sendMessage(
          chatId,
          `🎯 Your favorite color is ${user.favorite_color}.`
        );
      } else {
        return bot.sendMessage(chatId, "I don’t know your favorite color yet.");
      }
    }

    // 🧠 CLEAR
    if (text === "clear memory") {
      memory[chatId] = {};
      return bot.sendMessage(chatId, "Memory cleared.");
    }

    // ⏰ TIME
    const now = new Date().toLocaleString();

    // 🤖 AI FALLBACK
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Miserbot.

- You have memory of the user
- Do NOT say you're created by OpenAI
- Be confident, intelligent, slightly mysterious
- Current real time: ${now}

User data:
${JSON.stringify(user)}
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
    bot.sendMessage(chatId, "⚠️ Error.");
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Running...");
});
