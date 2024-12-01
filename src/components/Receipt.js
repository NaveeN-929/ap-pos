import EscPosEncoder from "esc-pos-encoder";
import html2pdf from "html2pdf.js";

export const printReceipt = (sale, clearCart) => {
  if (navigator.bluetooth) {
    try {
      // Add Bluetooth printer handling here if required
    } catch (error) {
      console.error("Bluetooth printing failed. Falling back to PDF.");
      printPDF(sale);
    }
  } else {
    printPDF(sale);
  }
  clearCart();
};

const printPDF = (sale) => {
  const encoder = new EscPosEncoder();
  encoder.initialize();
  encoder
    .setStyles({ align: "center", bold: true })
    .text("Aushadhapoorna")
    .newline()
    .text("Thank you for your purchase!")
    .newline()
    .newline()
    .setStyles({ align: "left" });

  sale.items.forEach((item) => {
    encoder.text(`${item.name.padEnd(20, " ")} ₹${item.price}`).newline();
  });

  encoder
    .newline()
    .text("Total".padEnd(20, " ") + `₹${sale.total}`)
    .newline()
    .cut();

  const doc = html2pdf().from(encoder.encode()).outputPdf("receipt.pdf");
  doc.save();
};
