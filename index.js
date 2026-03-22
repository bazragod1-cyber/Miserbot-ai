import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";

// ENV VARIABLES (from Render)
const bot = new TelegramBot(process.env.BOT_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// WEBHOOK SETUP
const url = process.env.RENDER_EXTERNAL_URL;
bot.setWebHook(`${url}/bot${process.env.BOT_TOKEN}`);

// EXPRESS SERVER (REQUIRED FOR RENDER)
import express from "express";
const app = express();
app.use(express.json());

// TELEGRAM WEBHOOK ENDPOINT
app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// BASIC ROUTE (so site loads)
app.get("/", (req, res) => {
  res.send("Miserbot is running 🚀");
});

// MESSAGE HANDLER
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  if (!userMessage) return;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Miserbot, a helpful, smart AI assistant. Always give accurate, real-time aware answers.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = response.choices[0].message.content;

    bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "⚠️ Error talking to AI.");
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
