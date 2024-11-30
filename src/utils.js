import { jsPDF } from "jspdf";

export const printPDF = (sale) => {
  const doc = new jsPDF();
  doc.text("Store Name", 10, 10);
  doc.text("Thank you for your purchase!", 10, 20);
  doc.text("---- Receipt ----", 10, 30);

  let y = 40;
  sale.items.forEach(item => {
    doc.text(`${item.name} - ₹${item.price}`, 10, y);
    y += 10;
  });

  doc.text(`Total: ₹${sale.total}`, 10, y);
  doc.save("receipt.pdf");
};
