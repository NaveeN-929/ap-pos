import React, { useContext } from "react";
import { CartContext } from "../contexts/CartContext";

function ReceiptPreview() {
  const { cart } = useContext(CartContext);

  const totalAmount = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="receipt-preview">
      <h3>Receipt Preview</h3>
      <p>Store Name</p>
      <p>Thank you for your purchase!</p>
      <p>---- Receipt ----</p>
      {cart.map(item => (
        <p key={item.id}>{item.name} - ₹{item.price}</p>
      ))}
      <p>Total: ₹{totalAmount}</p>
    </div>
  );
}

export default ReceiptPreview;
