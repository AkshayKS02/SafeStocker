import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function generateInvoice(invoiceData) {

  // Load invoice HTML served over HTTP so CSS loads properly
  const templateUrl = "http://localhost:5000/templates/invoice.html";

  const browser = await puppeteer.launch({
    headless: "new"
  });

  const page = await browser.newPage();
  await page.goto(templateUrl, { waitUntil: "networkidle0" });

  // Inject invoice data into the HTML DOM
  await page.evaluate((data) => {

    // Basic invoice info
    document.getElementById("invoice_no").innerText = data.invoice_no;
    document.getElementById("invoice_date").innerText = data.date;

    // Bill To
    document.getElementById("bill_name").innerText = data.customer.name;
    document.getElementById("bill_addr1").innerText = data.customer.address1;
    document.getElementById("bill_addr2").innerText = data.customer.address2;

    // Items table
    const tbody = document.getElementById("items_tbody");
    tbody.innerHTML = "";

    data.items.forEach(item => {
      const row = `
        <tr>
          <td>${item.description}</td>
          <td class="center">${item.qty}</td>
          <td class="right">₹${item.price.toFixed(2)}</td>
          <td class="right">₹${(item.qty * item.price).toFixed(2)}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    // Totals
    document.getElementById("subtotal").innerText =
      `₹${data.subtotal.toFixed(2)}`;

    document.getElementById("tax_amount").innerText =
      `₹${data.tax_amount.toFixed(2)}`;

    document.getElementById("grand_total").innerText =
      `₹${data.grand_total.toFixed(2)}`;

  }, invoiceData);

  // Output file path
  const outPath = path.join(__dirname, `../invoice_${Date.now()}.pdf`);

  // Generate PDF
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" }
  });

  await browser.close();
  return outPath;
}
