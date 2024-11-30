import React, { useContext } from "react";
import { CartContext } from "../contexts/CartContext";

const Menu = () => {
  const menuItems = [
    { id: 1, name: "soup", price: 48 },
    { id: 2, name: "ragi laddu", price: 15 },
    { id: 3, name: "pearl laddu", price: 20 },
    { id: 3, name: "foxtail laddu", price: 20 },
    { id: 3, name: " laddu", price: 20 },

  ];

  const { addItem } = useContext(CartContext);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className="p-2 bg-blue-500 text-white rounded"
          onClick={() => addItem(item)}
        >
          {item.name} - ₹{item.price}
        </button>
      ))}
    </div>
  );
};

export default Menu;
