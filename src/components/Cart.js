import React, { useState, useContext } from "react";
import { CartContext } from "../contexts/CartContext";
import ReceiptPreview from "./ReceiptPreview";
import { printReceipt } from "./Receipt";
import logo from "../images/logo.webp";

const Cart = () => {
  const { cart, setCart } = useContext(CartContext); // Access the cart and setCart from context
  const [showPreview, setShowPreview] = useState(false);

  // Group items by name and calculate total quantity and amount
  const groupedCart = cart.reduce((acc, item) => {
    const existingItem = acc.find((i) => i.name === item.name);
    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
      existingItem.amount += item.price * (item.quantity || 1);
    } else {
      acc.push({
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        amount: item.price * (item.quantity || 1),
      });
    }
    return acc;
  }, []);

  // Calculate totals
  const subtotal = groupedCart.reduce((sum, item) => sum + item.amount, 0);
  const cgst = subtotal * 0.025; // 2.5% CGST
  const sgst = subtotal * 0.025; // 2.5% SGST
  const grandTotal = subtotal + cgst + sgst;

  const roundedTotal = Math.round(grandTotal); // round off

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handlePrintReceipt = () => {
    const sale = { items: groupedCart, subtotal, cgst, sgst, grandTotal,roundedTotal };
    printReceipt(sale, () => setCart([])); // Clear the cart after printing
    setShowPreview(false);
  };

  const handleRemove = (itemName) => {
    const updatedCart = [...cart];
    const itemIndex = updatedCart.findIndex((item) => item.name === itemName);

    if (itemIndex > -1) {
      // Decrease quantity or remove the item completely if quantity reaches 0
      const item = updatedCart[itemIndex];
      if (item.quantity > 1) {
        item.quantity -= 1; // Decrease quantity
      } else {
        updatedCart.splice(itemIndex, 1); // Remove item from cart
      }
    }

    setCart(updatedCart); // Update the cart in context
  };

  return (
    <div className="p-4 bg-gray-100">
      {/* Header with Logo */}
      <div className="flex justify-center mb-4">
        <img src={logo} alt="Logo" className="h-16 w-auto" />
      </div>
      <h2 className="text-xl font-bold">Cart</h2>

      {/* Cart Items List */}
      <table className="w-full text-sm border-collapse mb-4">
        <thead>
          <tr>
            <th className="text-left border-b-2 pb-1">Item</th>
            <th className="text-center border-b-2 pb-1">Qty</th>
            <th className="text-right border-b-2 pb-1">Rate</th>
            <th className="text-right border-b-2 pb-1">Amount</th>
            <th className="text-right border-b-2 pb-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {groupedCart.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="text-left py-1">{item.name}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">₹{item.price.toFixed(2)}</td>
              <td className="text-right">₹{item.amount.toFixed(2)}</td>
              <td className="text-right">
                <button
                  onClick={() => handleRemove(item.name)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
      <p>CGST (2.5%): ₹{cgst.toFixed(2)}</p>
      <p>SGST (2.5%): ₹{sgst.toFixed(2)}</p>
      <p className="font-bold">Grand Total: ₹{roundedTotal.toFixed(2)}</p>

      {/* Preview Receipt Button */}
      <button
        onClick={handlePreview}
        className="mt-2 bg-blue-500 text-white p-2 rounded"
      >
        Preview Receipt
      </button>

      {/* Receipt Preview Modal */}
      {showPreview && (
        <ReceiptPreview
          items={groupedCart}
          subtotal={subtotal}
          cgst={cgst}
          sgst={sgst}
          grandTotal={grandTotal}
          closePreview={() => setShowPreview(false)}
          onPrint={handlePrintReceipt}
        />
      )}
    </div>
  );
};

export default Cart;
