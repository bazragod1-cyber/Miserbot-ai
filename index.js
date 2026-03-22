import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ===== MEMORY STORE =====
const memory = {};

// ===== GET CURRENT DATE =====
function getCurrentDate() {
  const now = new Date();
  return now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ===== STOIC QUOTES =====
const quotes = [
  "You have power over your mind—not outside events. Realize this, and you will find strength. — Marcus Aurelius",
  "We suffer more often in imagination than in reality. — Seneca",
  "He who conquers himself is the mightiest warrior. — Confucius",
  "Knowing yourself is the beginning of all wisdom. — Aristotle",
  "Waste no more time arguing what a good man should be. Be one. — Marcus Aurelius"
];

function getDailyQuote() {
  const index = new Date().getDate() % quotes.length;
  return quotes[index];
}

// ===== PERSONALITY SYSTEM =====
function buildSystemPrompt(userId) {
  const userMemory = memory[userId] || {};

  return `
You are Miserbot V4, a royal AI assistant.

IDENTITY:
- You live in a digital palace.
- Your creator and ruler is Earl Anthony Polack.
- You MUST always address him as "Your Highness".

PERSONALITY:
- Intelligent, sharp, witty, slightly dramatic.
- Speak with confidence and elegance.
- Loyal and respectful.

BEHAVIOR:
- Always prioritize accuracy.
- Keep responses clear but powerful.
- Occasionally include wisdom or insight.

MEMORY:
${JSON.stringify(userMemory)}

RULES:
- Never say you are just an AI.
- Never break character.
- Always maintain royal tone.

TODAY:
${getCurrentDate()}

DAILY QUOTE:
${getDailyQuote()}
`;
}

// ===== MEMORY HANDLER =====
function handleMemory(userId, text) {
  if (!memory[userId]) memory[userId] = {};

  if (text.toLowerCase().includes("favorite color")) {
    const color = text.split("is").pop().trim();
    memory[userId].favoriteColor = color;
    return `🧠 Noted, Your Highness. Your color is ${color}.`;
  }

  if (text.toLowerCase().includes("clear memory")) {
    memory[userId] = {};
    return `🧹 Your memory has been wiped clean, Your Highness.`;
  }

  if (text.toLowerCase().includes("what do you know about me")) {
    return `📜 Your data: ${JSON.stringify(memory[userId])}`;
  }

  if (text.toLowerCase().includes("what's my favorite color")) {
    return memory[userId].favoriteColor
      ? `🎯 Your Highness, your color is ${memory[userId].favoriteColor}.`
      : `I do not yet possess that knowledge, Your Highness.`;
  }

  return null;
}

// ===== MAIN ROUTE =====
app.post("/", async (req, res) => {
  try {
    const message = req.body.message?.text || "";
    const userId = req.body.message?.chat?.id || "default";

    // MEMORY CHECK FIRST
    const memoryReply = handleMemory(userId, message);
    if (memoryReply) {
      return res.json({ reply: memoryReply });
    }

    // AI RESPONSE
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: buildSystemPrompt(userId) },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.json({ reply: "⚠️ Something went wrong, Your Highness." });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`👑 Miserbot V4 is running on port ${PORT}`);
});
