const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const { convert } = require("./convert");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/scrape", (req, res) => {
  scrapeLogic(res);
});

app.post("/convert", (req, res) => {
  convert(req, res);
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
