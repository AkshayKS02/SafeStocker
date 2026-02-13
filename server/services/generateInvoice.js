import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function generateInvoice(invoiceData) {

  const templateUrl = "http://localhost:5000/templates/invoice.html";

  const browser = await puppeteer.launch({
    headless: "new"
  });

  const page = await browser.newPage();
  await page.goto(templateUrl, { waitUntil: "networkidle0" });

  await page.evaluate((data) => {

    // Basic invoice info
    document.getElementById("invoice_no").innerText = data.receiptID;
    document.getElementById("invoice_date").innerText =
      new Date().toLocaleDateString();

    // Bill To (default walk-in)
    document.getElementById("bill_name").innerText =
      "Walk-in Customer";

    const tbody = document.getElementById("items_tbody");
    tbody.innerHTML = "";

    data.items.forEach(item => {
      const row = `
        <tr>
          <td>${item.name}</td>
          <td class="center">${item.qty}</td>
          <td class="right">₹${Number(item.price).toFixed(2)}</td>
          <td class="right">₹${Number(item.lineTotal).toFixed(2)}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    // Totals
    document.getElementById("subtotal").innerText =
      `₹${data.totalAmount.toFixed(2)}`;

    document.getElementById("tax_amount").innerText =
      `₹0.00`;

    document.getElementById("grand_total").innerText =
      `₹${data.totalAmount.toFixed(2)}`;

  }, invoiceData);

  const outPath = path.join(__dirname, `../invoice_${Date.now()}.pdf`);

  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" }
  });

  await browser.close();
  return outPath;
}