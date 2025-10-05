// server.js
const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/convert", async (req, res) => {
  const { html, url } = req.body;

  if (!html && !url) {
    return res.status(400).send("HTML content or URL is required.");
  }

  let browser;
  try {
    // Launch Puppeteer with bundled Chromium
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // Optional: set a default viewport
    await page.setViewport({ width: 1200, height: 800 });

    if (html) {
      // Convert raw HTML
      await page.setContent(html, { waitUntil: "networkidle0" });
    } else if (url) {
      // Convert URL with timeout of 2 minutes
      await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
    }

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      scale: 0.8, // shrink content to fit page
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close();

    // Send PDF as response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="converted.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF conversion failed:", error);
    if (browser) await browser.close();
    res
      .status(500)
      .send(`Failed to convert HTML to PDF. Error: ${error.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
