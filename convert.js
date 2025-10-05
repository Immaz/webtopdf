const puppeteer = require("puppeteer");
require("dotenv").config();

async function convert(req, res) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).send("URL is required.");
  }

  let browser;
  try {
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

    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      scale: 0.525, // 👈 main factor for fitting
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
    });

    await browser.close();

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
}

module.exports = { convert };
