const express = require("express");
const app = express();

// VERY IMPORTANT 👇
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Miserbot is alive 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
