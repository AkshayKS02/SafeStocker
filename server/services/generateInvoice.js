import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

function drawTableHeader(doc, y) {
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Item", 50, y)
    .text("Qty", 300, y, { width: 50, align: "right" })
    .text("Price", 370, y, { width: 80, align: "right" })
    .text("Total", 470, y, { width: 75, align: "right" });

  doc
    .moveTo(50, y + 18)
    .lineTo(545, y + 18)
    .strokeColor("#cccccc")
    .stroke();

  doc.strokeColor("#000000");
}

function drawInvoiceRow(doc, item, y) {
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(item.name, 50, y, { width: 230 })
    .text(String(item.qty), 300, y, { width: 50, align: "right" })
    .text(currency(item.price), 370, y, { width: 80, align: "right" })
    .text(currency(item.lineTotal), 470, y, { width: 75, align: "right" });
}

export default async function generateInvoice(invoiceData) {
  const outPath = path.join(__dirname, `../invoice_${Date.now()}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(outPath);

    stream.on("finish", () => resolve(outPath));
    stream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(stream);

    doc
      .font("Helvetica-Bold")
      .fontSize(24)
      .text("SafeStocker Invoice", { align: "center" });

    doc.moveDown();

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(`Invoice ID: ${invoiceData.receiptID}`)
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .moveDown()
      .text("Customer: Walk-in Customer");

    doc.moveDown(2);
    drawTableHeader(doc, doc.y);

    let y = doc.y + 28;

    invoiceData.items.forEach((item) => {
      if (y > 720) {
        doc.addPage();
        drawTableHeader(doc, 50);
        y = 78;
      }

      drawInvoiceRow(doc, item, y);
      y += 24;
    });

    doc
      .moveTo(50, y + 4)
      .lineTo(545, y + 4)
      .strokeColor("#cccccc")
      .stroke();

    doc
      .strokeColor("#000000")
      .font("Helvetica-Bold")
      .fontSize(14)
      .text(`Grand Total: ${currency(invoiceData.totalAmount)}`, 350, y + 22, {
        width: 195,
        align: "right"
      });

    doc.end();
  });
}
