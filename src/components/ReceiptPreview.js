import React from "react";

const ReceiptPreview = ({ sale, closePreview, onPrint }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded shadow-md w-64 text-xs">
        <div className="text-center mb-4">
          <h2 className="font-bold">Aushadhapoorna</h2>
          <p>Thank you for your purchase!</p>
          <hr />
        </div>
        <ul>
          {sale.items.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.name}</span>
              <span>₹{item.price}</span>
            </li>
          ))}
        </ul>
        <hr />
        <div className="flex justify-between font-bold mt-2">
          <span>Total</span>
          <span>₹{sale.total}</span>
        </div>
        <hr />
        <div className="flex justify-between mt-4">
          <button
            className="bg-gray-500 text-white p-2 rounded"
            onClick={closePreview}
          >
            Close
          </button>
          <button
            className="bg-green-500 text-white p-2 rounded"
            onClick={onPrint}
          >
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;
