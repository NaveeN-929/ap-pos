import React, { useState, useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import ReceiptPreview from "./ReceiptPreview";
import { printReceipt } from "./Receipt";

const Cart = () => {
  const { cart, removeItem, clearCart } = useContext(CartContext);
  const [showPreview, setShowPreview] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handlePreview = () => {
    const sale = { items: cart, total };
    setCurrentSale(sale);
    setShowPreview(true);
  };

  const handlePrintReceipt = () => {
    printReceipt(currentSale, clearCart);
    setShowPreview(false);
  };

  return (
    <div className="p-4 bg-gray-100">
      <h2 className="text-xl font-bold">Cart</h2>
      <ul>
        {cart.map((item, index) => (
          <li key={index} className="flex justify-between">
            {item.name} - ₹{item.price}
            <button
              onClick={() => removeItem(index)}
              className="text-red-500"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p>Total: ₹{total}</p>
      <button
        onClick={handlePreview}
        className="mt-2 bg-blue-500 text-white p-2 rounded"
      >
        Preview Receipt
      </button>

      {/* Receipt Preview Modal */}
      {showPreview && (
        <ReceiptPreview
          sale={currentSale}
          closePreview={() => setShowPreview(false)}
          onPrint={handlePrintReceipt}
        />
      )}
    </div>
  );
};

export default Cart;
