import React, { createContext, useState } from "react";
import { addSale } from "../db/indexedDB";
import { printReceipt } from "../components/Receipt";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addItem = (item) => setCart([...cart, item]);

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const checkout = () => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const sale = { date: new Date().toISOString(), items: cart, total };
    addSale(sale);
    printReceipt(sale);
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, checkout }}>
      {children}
    </CartContext.Provider>
  );
};
