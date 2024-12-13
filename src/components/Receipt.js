import { jsPDF } from "jspdf";
import logo from "../images/logo.png";

// Function to handle the printing of the receipt
export const printReceipt = (sale, callback) => {
  const { items, subtotal, cgst, sgst, roundedTotal } = sale;

  const doc = new jsPDF({ unit: "mm", format: [80, 80] }); // Thermal printer dimensions

  // Set font for the document
  doc.setFont("helvetica");

  // Logo - resized and centered
  const imgWidth = 13;
  const imgHeight = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.addImage(logo, "webp", (pageWidth - imgWidth) / 2, 2, imgWidth, imgHeight);

  // Header Section - Center aligned
  doc.setFontSize(10);
  doc.text("Aushadhapoorna", pageWidth / 2, 15, { align: "center" });
  doc.setFontSize(6);
  doc.text("ph 9535354685", pageWidth / 2, 17.5, { align: "center" });

  doc.setFontSize(8);
  doc.text("GST: 2025DPPPK9628F", pageWidth / 2, 21, { align: "center" });

  // Section separator
  // doc.setLineWidth(0.3);
  doc.setLineDashPattern([1, 1], 0); 
  doc.line(2, 22, pageWidth - 2, 22); // Horizontal line

  // Date and Time - aligned left
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  doc.text(`Date: ${date}`, 5, 25);
  doc.text(`Time: ${time}`, 5, 28);

  // // Section separator
  // doc.setLineWidth(0.1);
  // doc.line(5, 31, pageWidth - 5, 31); // Horizontal line

  // Receipt Items Header - Center aligned
  // doc.setFontSize(9);
  // doc.text("TAX RECEIPT", pageWidth / 2, 34, { align: "center" });

  // Section separator
  // doc.setLineWidth(0.1);
  doc.setLineDashPattern([1, 1], 0); 
  doc.line(5, 29, pageWidth - 5, 29); // Horizontal line

  // Table Headers
  doc.setFontSize(8);
  doc.text("Item", 5, 33);
  doc.text("Qty", 35, 33);
  doc.text("Rate", 50, 33);
  doc.text("Amount", 65, 33);

  // Section separator
  // doc.setLineWidth(0.1);
  doc.setLineDashPattern([1, 1], 0); 
  doc.line(5, 34, pageWidth - 5, 34); // Horizontal line

  let yOffset = 38;

  // Items List
  items.forEach((item) => {
    doc.text(item.name, 5, yOffset);
    doc.text(item.quantity.toString(), 35, yOffset);
    doc.text(`₹${item.price.toFixed(2)}`, 46, yOffset);
    doc.text(`₹${(item.price * item.quantity).toFixed(2)}`, 62, yOffset);
    yOffset += 4; // Line spacing
  });

  // Line break for totals
  doc.setLineWidth(0.1);
  doc.line(5, yOffset, pageWidth - 5, yOffset);
  yOffset += 3;

  // Totals Section
  doc.setFontSize(8);
  doc.text(`Subtotal: ₹${subtotal.toFixed(2)}`, 42, yOffset);
  yOffset += 3;
  doc.text(`CGST(2.5%): ₹${cgst.toFixed(2)}`, 34.8, yOffset);
  yOffset += 3;
  doc.text(`SGST(2.5%): ₹${sgst.toFixed(2)}`, 35, yOffset);
  yOffset += 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`Grand Total:₹${roundedTotal.toFixed(2)}`, 35.5, yOffset, { align: "left" });

  // Footer Section
  yOffset += 2;
  doc.setFont("helvetica", "normal");
  doc.setLineWidth(0.3);
  doc.line(2, yOffset, pageWidth - 2, yOffset);
  yOffset += 3;
  doc.setFontSize(8);
  doc.text("Warm, Healthy Soups Await You", pageWidth / 2, yOffset, { align: "center" });
  yOffset += 4;
  doc.text("See You Again Soon", pageWidth / 2, yOffset, { align: "center" });

  // Optional callback to clear the cart
  if (callback) callback();

  // Print the receipt
  doc.autoPrint();
  doc.output("dataurlnewwindow");
};
