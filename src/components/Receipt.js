// // import React from "react";

// // const Receipt = ({ sale }) => {
// //   return (
// //     <div id="receipt" className="p-4 text-xs">
// //       <div className="text-center mb-4">
// //         <h2 className="text-xl font-bold">Store Name</h2>
// //         <p>Thank you for your purchase!</p>
// //       </div>
// //       <ul className="mb-4">
// //         {sale.items.map((item, index) => (
// //           <li key={index} className="flex justify-between py-1">
// //             <span>{item.name}</span>
// //             <span>₹{item.price}</span>
// //           </li>
// //         ))}
// //       </ul>
// //       <div className="flex justify-between mt-4 font-bold">
// //         <span>Total</span>
// //         <span>₹{sale.total}</span>
// //       </div>
// //       <div className="mt-6 text-center">
// //         <p>Visit us again!</p>
// //       </div>
// //     </div>
// //   );
// // };

// // export const printReceipt = (clearCart) => {
// //   const receipt = document.getElementById("receipt");
// //   const printWindow = window.open("", "_blank");
// //   printWindow.document.write(receipt.innerHTML);
// //   printWindow.document.close();
// //   printWindow.print();
// //   printWindow.close();
  
// //   // Clear the cart after printing
// //   clearCart();
// // };

// // export default Receipt;




// import React from "react";
// import EscPosEncoder from "esc-pos-encoder";
// import html2pdf from "html2pdf.js";
// import { Printer } from "esc-pos-printer";
// import { printPDF } from "../utils.js"; 

// // Utility to print via Bluetooth/USB (thermal printer)
// const printViaBluetooth = async (clearCart, sale) => {
//   if (!navigator.bluetooth) {
//     alert("Bluetooth is not supported by your browser.");
//     return;
//   }

//   try {
//     // Request a Bluetooth device
//     const device = await navigator.bluetooth.requestDevice({
//       filters: [{ name: "Mini Thermal Printer" }],
//       optionalServices: ["printer_service"],
//     });

//     // Connect to the Bluetooth device
//     const server = await device.gatt.connect();
//     const service = await server.getPrimaryService("printer_service");
//     const characteristic = await service.getCharacteristic("printer_characteristic");

//     // Encode receipt using ESC/POS commands
//     const encoder = new EscPosEncoder();
//     encoder.setStyles({ align: "center", fontSize: 24 });
//     encoder.text("Store Name");
//     encoder.text("Thank you for your purchase!");
//     sale.items.forEach(item => {
//       encoder.text(`${item.name} - ₹${item.price}`);
//     });
//     encoder.text(`Total: ₹${sale.total}`);
//     encoder.cut();

//     // Send the formatted command to the printer
//     const command = encoder.encode();
//     await characteristic.writeValue(command);

//     // Clear cart after printing
//     clearCart();
//   } catch (error) {
//     console.error("Error connecting to printer:", error);
//     alert("Failed to connect to the printer. Printing as PDF...");
//     printReceiptAsPDF(sale, clearCart);
//   }
// };

// // Utility to print as PDF (if printer is not connected)
// const printReceiptAsPDF = (sale, clearCart) => {
//   const receiptElement = document.getElementById("receipt");
  
//   html2pdf()
//     .from(receiptElement)
//     .save("receipt.pdf")
//     .then(() => {
//       clearCart();
//     });
// };

// const Receipt = ({ sale, clearCart }) => {
//   const handlePrint = async () => {
//     const isBluetoothConnected = await checkBluetoothConnection();
    
//     if (isBluetoothConnected) {
//       printViaBluetooth(clearCart, sale); // Print via Bluetooth if connected
//     } else {
//       printReceiptAsPDF(sale, clearCart); // Fallback to PDF printing
//     }
//   };

//   const checkBluetoothConnection = async () => {
//     try {
//       const device = await navigator.bluetooth.requestDevice({
//         filters: [{ name: "Mini Thermal Printer" }],
//         optionalServices: ["printer_service"],
//       });
//       return device !== null;
//     } catch (error) {
//       return false; // Return false if no Bluetooth printer is found
//     }
//   };

//   return (
//     <div id="receipt" className="p-4 text-xs">
//       <div className="text-center mb-4">
//         <h2 className="text-xl font-bold">Store Name</h2>
//         <p>Thank you for your purchase!</p>
//       </div>
//       <ul className="mb-4">
//         {sale.items.map((item, index) => (
//           <li key={index} className="flex justify-between py-1">
//             <span>{item.name}</span>
//             <span>₹{item.price}</span>
//           </li>
//         ))}
//       </ul>
//       <div className="flex justify-between mt-4 font-bold">
//         <span>Total</span>
//         <span>₹{sale.total}</span>
//       </div>
//       <div className="mt-6 text-center">
//         <p>Visit us again!</p>
//       </div>
//       <div className="mt-4 flex justify-between">
//         <button
//           className="bg-gray-500 text-white p-2 rounded"
//           onClick={clearCart}
//         >
//           Close
//         </button>
//         <button
//           className="bg-green-500 text-white p-2 rounded"
//           onClick={handlePrint} // Trigger print on click
//         >
//           Print Receipt
//         </button>
//       </div>
//     </div>
//   );
// };

// // export const printReceipt = (clearCart) => {
// //   const receipt = document.getElementById("receipt");
// //   const printWindow = window.open("", "_blank");
// //   printWindow.document.write(receipt.innerHTML);
// //   printWindow.document.close();
// //   printWindow.print();
// //   printWindow.close();

// //   // Clear the cart after printing
// //   clearCart();
// // };

// export const printReceipt = (clearCart) => {
//   // Check for printer connection (Bluetooth or USB)
//   if (navigator.bluetooth) {
//     // Try connecting to Bluetooth printer
//     navigator.bluetooth.requestDevice({
//       filters: [{ services: ['printer'] }]
//     })
//     .then(device => {
//       return device.gatt.connect();
//     })
//     .then(server => {
//       const printer = new Printer(server);
//       printer.text("Store Name\nThank you for your purchase!\n");
//       printer.text("---- Receipt ----\n");
      
//       sale.items.forEach(item => {
//         printer.text(`${item.name} - ₹${item.price}\n`);
//       });

//       printer.text(`Total: ₹${sale.total}\n`);
//       printer.cut();
//       printer.close();
//     })
//     .catch(error => {
//       console.log("Bluetooth Printer Error:", error);
//       // If Bluetooth printing fails, offer PDF option
//       printPDF(sale);
//     });
//   } else if (navigator.usb) {
//     // Try connecting to USB printer
//     navigator.usb.requestDevice({ filters: [{ vendorId: 0x1234 }] })
//       .then(device => {
//         return device.open();
//       })
//       .then(device => {
//         const printer = new Printer(device);
//         printer.text("Store Name\nThank you for your purchase!\n");
//         printer.text("---- Receipt ----\n");

//         sale.items.forEach(item => {
//           printer.text(`${item.name} - ₹${item.price}\n`);
//         });

//         printer.text(`Total: ₹${sale.total}\n`);
//         printer.cut();
//         printer.close();
//       })
//       .catch(error => {
//         console.log("USB Printer Error:", error);
//         // If USB printing fails, offer PDF option
//         printPDF(sale);
//       });
//   } else {
//     // If neither Bluetooth nor USB is available, fall back to PDF
//     printPDF(sale);
//   }
  
//   clearCart(); // Clear the cart after printing
// };
// export default Receipt;

import React from "react";
import EscPosEncoder from "esc-pos-encoder";
import html2pdf from "html2pdf.js";
import { Printer } from "esc-pos-printer";
import { printPDF } from "../utils.js"; // Assume this utility generates a PDF for receipt printing

// Utility to print via Bluetooth (thermal printer)
const printViaBluetooth = async (clearCart, sale) => {
  if (!navigator.bluetooth) {
    alert("Bluetooth is not supported by your browser.");
    return;
  }

  try {
    // Request a Bluetooth device
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: "Mini Thermal Printer" }],
      optionalServices: ["printer_service"],
    });

    // Connect to the Bluetooth device
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("printer_service");
    const characteristic = await service.getCharacteristic("printer_characteristic");

    // Encode receipt using ESC/POS commands
    const encoder = new EscPosEncoder();
    encoder.setStyles({ align: "center", fontSize: 24 });
    encoder.text("Store Name");
    encoder.text("Thank you for your purchase!");
    sale.items.forEach(item => {
      encoder.text(`${item.name} - ₹${item.price}`);
    });
    encoder.text(`Total: ₹${sale.total}`);
    encoder.cut();

    // Send the formatted command to the printer
    const command = encoder.encode();
    await characteristic.writeValue(command);

    // Clear cart after printing
    clearCart();
  } catch (error) {
    console.error("Error connecting to printer:", error);
    alert("Failed to connect to the printer. Printing as PDF...");
    printReceiptAsPDF(sale, clearCart);
  }
};

// Utility to print as PDF (if printer is not connected)
const printReceiptAsPDF = (sale, clearCart) => {
  const receiptElement = document.getElementById("receipt");

  html2pdf()
    .from(receiptElement)
    .save("receipt.pdf")
    .then(() => {
      clearCart();
    });
};

const Receipt = ({ sale, clearCart }) => {
  // Function to check Bluetooth connection
  const handlePrint = async () => {
    const isBluetoothConnected = await checkBluetoothConnection();

    if (isBluetoothConnected) {
      printViaBluetooth(clearCart, sale); // Print via Bluetooth if connected
    } else {
      printReceiptAsPDF(sale, clearCart); // Fallback to PDF printing
    }
  };

  const checkBluetoothConnection = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ name: "Mini Thermal Printer" }],
        optionalServices: ["printer_service"],
      });
      return device !== null;
    } catch (error) {
      return false; // Return false if no Bluetooth printer is found
    }
  };

  return (
    <div id="receipt" className="p-4 text-xs">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">Store Name</h2>
        <p>Thank you for your purchase!</p>
      </div>
      <ul className="mb-4">
        {sale.items.map((item, index) => (
          <li key={index} className="flex justify-between py-1">
            <span>{item.name}</span>
            <span>₹{item.price}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between mt-4 font-bold">
        <span>Total</span>
        <span>₹{sale.total}</span>
      </div>
      <div className="mt-6 text-center">
        <p>Visit us again!</p>
      </div>
      <div className="mt-4 flex justify-between">
        <button
          className="bg-gray-500 text-white p-2 rounded"
          onClick={clearCart}
        >
          Close
        </button>
        <button
          className="bg-green-500 text-white p-2 rounded"
          onClick={handlePrint} // Trigger print on click
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

// printReceipt function (use the `sale` prop in this function)
export const printReceipt = (clearCart, sale) => {
  // Check for printer connection (Bluetooth or USB)
  if (navigator.bluetooth) {
    // Try connecting to Bluetooth printer
    navigator.bluetooth.requestDevice({
      filters: [{ services: ['printer'] }]
    })
    .then(device => {
      return device.gatt.connect();
    })
    .then(server => {
      const printer = new Printer(server);
      printer.text("Store Name\nThank you for your purchase!\n");
      printer.text("---- Receipt ----\n");

      sale.items.forEach(item => {
        printer.text(`${item.name} - ₹${item.price}\n`);
      });

      printer.text(`Total: ₹${sale.total}\n`);
      printer.cut();
      printer.close();
    })
    .catch(error => {
      console.log("Bluetooth Printer Error:", error);
      // If Bluetooth printing fails, offer PDF option
      printPDF(sale);
    });
  } else if (navigator.usb) {
    // Try connecting to USB printer
    navigator.usb.requestDevice({ filters: [{ vendorId: 0x1234 }] })
      .then(device => {
        return device.open();
      })
      .then(device => {
        const printer = new Printer(device);
        printer.text("Store Name\nThank you for your purchase!\n");
        printer.text("---- Receipt ----\n");

        sale.items.forEach(item => {
          printer.text(`${item.name} - ₹${item.price}\n`);
        });

        printer.text(`Total: ₹${sale.total}\n`);
        printer.cut();
        printer.close();clearCart={clearCart}
      })
      .catch(error => {
        console.log("USB Printer Error:", error);
        // If USB printing fails, offer PDF option
        printPDF(sale);
      });
  } else {
    // If neither Bluetooth nor USB is available, fall back to PDF
    printPDF(sale);
  }

  clearCart(); // Clear the cart after printing
};

export default Receipt;

