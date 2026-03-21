const express = require('express');
const app = express();

app.use(express.json());

// 👉 Telegram webhook endpoint
app.post('/', async (req, res) => {
  const message = req.body.message;

  if (message && message.text) {
    const chatId = message.chat.id;
    const text = message.text;

    // simple reply
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `You said: ${text}`
      })
    });
  }

  res.sendStatus(200);
});

// 👉 test route (important for Render)
app.get('/', (req, res) => {
  res.send('Bot is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
