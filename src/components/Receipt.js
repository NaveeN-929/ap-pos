import EscPosEncoder from "esc-pos-encoder";
import html2pdf from "html2pdf.js";
import logo from "../images/logo.webp";

export const printReceipt = async (sale, clearCart) => {
  try {
    const encoder = new EscPosEncoder();
    encoder.initialize();

    // Fetch current date and time
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Load the logo image for the receipt
    const logoImage = await loadImage(logo);

    encoder
      .setAlign("center")
      .image(logoImage, 384, 128) // Adjust dimensions for thermal printer compatibility
      // .newline()
      .text("Aushadhapoorna")
      // .newline()
      // .text("NH 3, Mumbai Nashik Highway")
      // .newline()
      // .text("Opp. Bhoir Pada Bus Stop, Near Padga")
      // .newline()
      // .text("Bhiwandi, Thane")
      .newline()
      .text("----------------------------------------")
      // .newline()
      .text(`Date: ${date}`.padEnd(20, " ") + `Time: ${time}`)
      .newline()
      .text(`GST: 2025DPPPK9628F`)
      .newline()
      .text("Tax Invoice")
      .newline()
      .text("----------------------------------------")
      .newline();

    // Add table header
    encoder
      .text("Particulars".padEnd(20, " ") + "Qty".padEnd(5, " ") + "Rate".padEnd(7, " ") + "Amount")
      .newline()
      .text("----------------------------------------")
      .newline();

    // Add sale items
    sale.items.forEach((item) => {
      encoder
        .text(
          `${item.name.padEnd(20, " ")}${item.quantity.toString().padEnd(5, " ")}₹${item.price
            .toFixed(2)
            .padEnd(7, " ")}₹${(item.price * item.quantity).toFixed(2)}`
        )
        .newline();
    });

    encoder
      .newline()
      .text("----------------------------------------")
      .newline()
      .text(`Subtotal`.padEnd(30, " ") + `₹${sale.subtotal.toFixed(2)}`)
      .newline()
      .text(`S.G.S.T @9%`.padEnd(30, " ") + `₹${sale.sgst.toFixed(2)}`)
      .newline()
      .text(`C.G.S.T @9%`.padEnd(30, " ") + `₹${sale.cgst.toFixed(2)}`)
      .newline()
      .text(`Grand Total`.padEnd(30, " ") + `₹${sale.grandTotal.toFixed(2)}`)
      .newline()
      .text("----------------------------------------")
      .newline()
      .text("Thank you for your purchase!")
      .newline()
      .text("Visit Again")
      .newline()
      .newline()
      .cut();

    // Send to thermal printer
    const bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
    });
    const server = await bluetoothDevice.gatt.connect();
    const service = await server.getPrimaryService("printer-service-uuid"); // Replace with your printer's UUID
    const characteristic = await service.getCharacteristic("printer-characteristic-uuid");
    await characteristic.writeValue(encoder.encode());

    clearCart();
  } catch (error) {
    console.error("Thermal printing failed. Falling back to PDF.");
    printPDF(sale);
  }
};

const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

export const printPDF = (sale) => {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const element = document.createElement("div");
  element.innerHTML = `
    <div style="text-align: center;">
      <img src="${logo}" alt="Logo" width="100" />
      <h2>Aushadhapoorna</h2>
      <hr />
      <p>Date: ${date} &nbsp;&nbsp;&nbsp; Time: ${time}</p>
      <p>GST: 2025DPPPK9628F</p>
      <h3>Tax Invoice</h3>
      <hr />
    </div>
    <table style="width: 100%; text-align: left; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Particulars</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${sale.items
          .map(
            (item) =>
              `<tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <hr />
    <p>Subtotal: ₹${sale.subtotal.toFixed(2)}</p>
    <p>S.G.S.T @9%: ₹${sale.sgst.toFixed(2)}</p>
    <p>C.G.S.T @9%: ₹${sale.cgst.toFixed(2)}</p>
    <p><strong>Grand Total: ₹${sale.grandTotal.toFixed(2)}</strong></p>
    <hr />
    <p style="text-align: center;">Thank you for your purchase!<br>Visit Again</p>
  `;

  html2pdf().from(element).set({ filename: "receipt.pdf" }).save();
};
