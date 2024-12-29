import { CatPrinter } from "../utils/printerProtocol";

let printerCharacteristic = null;

async function connectToPrinter() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["0000ae30-0000-1000-8000-00805f9b34fb"],
    });
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("0000ae30-0000-1000-8000-00805f9b34fb");
    printerCharacteristic = await service.getCharacteristic("0000ae01-0000-1000-8000-00805f9b34fb");
  } catch (error) {
    console.error("Failed to connect to printer:", error);
    throw new Error("Failed to connect to printer");
  }
}

async function sendDataToPrinter(data) {
  if (!printerCharacteristic) throw new Error("Printer not connected.");
  try {
    await printerCharacteristic.writeValue(data);
  } catch (error) {
    console.error("Failed to send data to printer:", error);
    throw new Error("Failed to send data to printer");
  }
}

export const printReceipt = async (sale, callback) => {
  const { items, subtotal, cgst, sgst, roundedTotal } = sale;

  const ESC = '\x1B';
  const LF = '\x0A';

  let receiptText = `${ESC}@`;
  receiptText += `${ESC}a1`;
  receiptText += `Aushadhapoorna\n`;
  receiptText += `ph 9535354685\n`;
  receiptText += `GST: 2025DPPPK9628F\n`;
  receiptText += `${LF}`;
  receiptText += `Date: ${new Date().toLocaleDateString()}  `;
  receiptText += `Time: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
  receiptText += `--------------------------------\n`;
  receiptText += `Item        Qty   Rate   Amount\n`;
  receiptText += `--------------------------------\n`;

  items.forEach((item, index) => {
    receiptText += `${item.name.padEnd(10)} ${item.quantity.toString().padEnd(5)} ₹${item.price.toFixed(2).padEnd(6)} ₹${(
      item.price * item.quantity
    ).toFixed(2)}\n`;
  });

  receiptText += `--------------------------------\n`;
  receiptText += `Subtotal: ₹${subtotal.toFixed(2)}\n`;
  receiptText += `CGST(2.5%): ₹${cgst.toFixed(2)}\n`;
  receiptText += `SGST(2.5%): ₹${sgst.toFixed(2)}\n`;
  receiptText += `${ESC}E1`;
  receiptText += `Grand Total: ₹${roundedTotal.toFixed(2)}\n`;
  receiptText += `${ESC}E0`;
  receiptText += `--------------------------------\n`;
  receiptText += `Warm, Healthy Soups Await You\n`;
  receiptText += `See You Again Soon\n`;
  receiptText += `${LF}${LF}${LF}`;

  try {
    if (!printerCharacteristic) {
      await connectToPrinter();
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(receiptText);

    const printer = new CatPrinter("KittyPrinter", sendDataToPrinter);
    await printer.prepare(8, 200);
    console.log('Printer prepared');
    await printer.draw(data);
    console.log('Data sent to printer');
    await printer.finish(100);
    console.log('Printer finished');

    console.log('Receipt printed successfully!');
  } catch (error) {
    console.error('Failed to print receipt:', error);
    alert('Error printing receipt: ' + error.message);
  }

  if (callback) {
    callback();
  }
};