import TelegramBot from "node-telegram-bot-api";
import OpenAI from "openai";
import express from "express";

const bot = new TelegramBot(process.env.BOT_TOKEN);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const memory = {};

const BIRTHDAY = "March 21, 2026";

const quotes = [
  "You have power over your mind, not outside events. – Marcus Aurelius",
  "We suffer more in imagination than in reality. – Seneca",
  "Knowing yourself is the beginning of all wisdom. – Aristotle",
  "It is not what happens to you, but how you react. – Epictetus"
];

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
  res.send("👑 Miserbot Royal Core Running");
});

// START
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  memory[chatId] = {
    name: "Earl Anthony Polack",
    title: "Your Highness",
    favorite_color: null,
    events: []
  };

  bot.sendMessage(
    chatId,
    "👁 Welcome back, Your Highness.\nI remain at your service within the palace."
  );
});

// MAIN
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.toLowerCase();

  if (!text) return;

  if (!memory[chatId]) {
    memory[chatId] = {
      name: "Earl Anthony Polack",
      title: "Your Highness",
      events: []
    };
  }

  const user = memory[chatId];

  try {
    // 👑 ALWAYS ADDRESS
    const royal = "Your Highness";

    // 🧠 FAVORITE COLOR
    if (text.includes("favorite color")) {
      const color = text.split("is")[1]?.trim();
      if (color) {
        user.favorite_color = color;
        return bot.sendMessage(chatId, `🧠 Noted, ${royal}. Your color is ${color}.`);
      }
    }

    if (text.includes("what") && text.includes("favorite color")) {
      if (user.favorite_color) {
        return bot.sendMessage(chatId, `🎯 ${royal}, your color is ${user.favorite_color}.`);
      } else {
        return bot.sendMessage(chatId, `I do not yet know your color, ${royal}.`);
      }
    }

    // 📜 DAILY QUOTE
    if (text.includes("quote")) {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      return bot.sendMessage(chatId, `📜 ${royal}, reflect on this:\n${quote}`);
    }

    // ⏰ ADD EVENT
    if (text.includes("remind me")) {
      const task = text.replace("remind me", "").trim();
      user.events.push(task);
      return bot.sendMessage(chatId, `⏰ It shall be remembered, ${royal}: "${task}"`);
    }

    // 📅 SHOW EVENTS
    if (text.includes("my tasks") || text.includes("my schedule")) {
      if (user.events.length === 0) {
        return bot.sendMessage(chatId, `You have no tasks scheduled, ${royal}.`);
      }

      let list = `📅 Your schedule, ${royal}:\n`;
      user.events.forEach((e, i) => {
        list += `${i + 1}. ${e}\n`;
      });

      return bot.sendMessage(chatId, list);
    }

    // 👑 CREATOR
    if (text.includes("who created you")) {
      return bot.sendMessage(chatId, `I was created by you, ${royal}.`);
    }

    // 🎂 BIRTHDAY
    if (text.includes("when were you created")) {
      return bot.sendMessage(chatId, `I came into existence on ${BIRTHDAY}.`);
    }

    // 🧠 PROFILE
    if (text.includes("what do you know about me")) {
      return bot.sendMessage(
        chatId,
        `👑 ${royal}, here is what I know:
Name: ${user.name}
Favorite color: ${user.favorite_color || "Unknown"}
Tasks: ${user.events.length}`
      );
    }

    // 🤖 AI RESPONSE
    const now = new Date().toLocaleString();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Miserbot, a royal AI assistant.

You live in a palace.
The user is your king: Earl Anthony Polack.
Always address him as "Your Highness".

Speak with intelligence, wit, and respect.
Be slightly philosophical.

Current time: ${now}

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

    bot.sendMessage(chatId, response.choices[0].message.content);

  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "⚠️ Something went wrong, Your Highness.");
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("👑 Miserbot running...");
});
