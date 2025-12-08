import generateInvoice from "../services/generateInvoice.js";
import fs from "fs";

export const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;

    // Call Puppeteer service → generates PDF and returns file path
    const pdfPath = await generateInvoice(invoiceData);

    // Download file → clean up after sending
    res.download(pdfPath, "invoice.pdf", (err) => {
      try { fs.unlinkSync(pdfPath); } catch (e) {}
      if (err) console.error("Download error:", err);
    });
  } catch (err) {
    console.error("Invoice generation error:", err);
    res.status(500).json({ error: "Invoice generation failed" });
  }
};
