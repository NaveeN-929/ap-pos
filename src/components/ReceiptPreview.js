import React from "react";
import logo from "../images/logo.webp";


const ReceiptPreview = ({
  items,
  subtotal,
  cgst,
  sgst,
  grandTotal,
  closePreview,
  onPrint,
}) => {
  // Fetch current date and time
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const roundedTotal = Math.round(grandTotal);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        {/* Header Section */}
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" className="w-20 mx-auto mb-0.2" />
          <h2 className="font-bold text-lg">Aushadhapoorna</h2>
          {/* <p>NH 3, Mumbai Nashik Highway</p>
          <p>Opp. Bhoir Pada Bus Stop, Near Padga</p>
          <p>Bhiwandi, Thane</p> */}
          <hr className="my-1" />
          <p>Date: {date}</p>
          <p>Time: {time}</p>
          <p>GST: 2025DPPPK9628F</p>
          <hr className="my-1" />
        </div>

        {/* Receipt Items Section */}
        <h2 className="text-xl font-bold mb-4 text-center">Receipt Preview</h2>
        <table className="w-full text-sm border-collapse mb-4">
          <thead>
            <tr>
              <th className="text-left border-b-2 pb-1">Item</th>
              <th className="text-center border-b-2 pb-1">Qty</th>
              <th className="text-right border-b-2 pb-1">Rate</th>
              <th className="text-right border-b-2 pb-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="text-left py-1">{item.name}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">₹{item.price.toFixed(2)}</td>
                <td className="text-right">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="text-right text-sm">
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p>CGST (2.5%): ₹{cgst.toFixed(2)}</p>
          <p>SGST (2.5%): ₹{sgst.toFixed(2)}</p>
          <p className="font-bold">Grand Total: ₹{roundedTotal.toFixed(2)}</p>
        </div>

        {/* Footer Section */}
        <hr className="my-4" />
        <p className="text-center text-sm">
          Warm, Healthy Soups Await You <br />
          See You Again Soon 😊 !
        </p>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-between">
          <button
            onClick={closePreview}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Close
          </button>
          <button
            onClick={onPrint}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;
