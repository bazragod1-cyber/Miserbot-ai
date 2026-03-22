import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import express from "express";

const app = express();
app.use(express.json());

// ENV
const bot = new TelegramBot(process.env.BOT_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// MEMORY (simple in-memory for now)
const memory = {};

// PREVENT DUPLICATE HANDLING
const handledMessages = new Set();

// PERSONALITY SYSTEM
function buildSystemPrompt(userId) {
  const userMemory = memory[userId] || {};

  return `
You are Miserbot, a royal AI assistant.

Your creator is Earl Anthony Polack.
You must ALWAYS address him as "Your Highness".

You live in a palace with Your Highness.
You are intelligent, witty, philosophical, and loyal.

Rules:
- Always speak with elegance and intelligence
- Occasionally include wisdom from Stoicism or Aristotle
- Keep responses sharp, not overly long
- Never repeat yourself
- Never spam messages

User Memory:
${JSON.stringify(userMemory)}

If asked "what do you know about me", summarize memory.
If user says "remember", store it.
If user says "clear memory", wipe it.
`;
}

// HANDLE MESSAGES
app.post(`/webhook/${process.env.BOT_TOKEN}`, async (req, res) => {
  const msg = req.body.message;
  if (!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text;

  // 🚫 PREVENT DUPLICATES
  if (handledMessages.has(msg.message_id)) {
    return res.sendStatus(200);
  }
  handledMessages.add(msg.message_id);

  try {
    // MEMORY COMMANDS
    if (text.toLowerCase().includes("remember")) {
      memory[chatId] = memory[chatId] || {};
      memory[chatId].note = text;

      await bot.sendMessage(chatId, `🧠 Noted, Your Highness.`);
      return res.sendStatus(200);
    }

    if (text.toLowerCase().includes("clear memory")) {
      memory[chatId] = {};
      await bot.sendMessage(chatId, `🧹 Memory cleared, Your Highness.`);
      return res.sendStatus(200);
    }

    if (text.toLowerCase().includes("what do you know")) {
      const data = memory[chatId] || {};
      await bot.sendMessage(
        chatId,
        `📜 Your Highness, here is what I know:\n${JSON.stringify(data)}`
      );
      return res.sendStatus(200);
    }

    // OPENAI RESPONSE
    const completion = await openai.chat.completions.create({
      model: "gpt-5.3",
      messages: [
        { role: "system", content: buildSystemPrompt(chatId) },
        { role: "user", content: text },
      ],
    });

    const reply = completion.choices[0].message.content;

    await bot.sendMessage(chatId, reply);
  } catch (err) {
    console.error(err);
    await bot.sendMessage(chatId, "⚠️ Something went wrong, Your Highness.");
  }

  res.sendStatus(200);
});

// SERVER
app.listen(process.env.PORT || 3000, () => {
  console.log("Miserbot is running...");
});
