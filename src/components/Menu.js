import React, { useContext } from "react";
import { CartContext } from "../contexts/CartContext";

const Menu = () => {
  const menuItems = [
    { id: 1, name: "Soup", price: 46 },
    { id: 2, name: "Ragi laddu", price: 26 },
    { id: 3, name: "Pearl laddu", price: 26 },
    { id: 3, name: "Foxtail laddu", price: 26 },
    { id: 3, name: "Barnyard laddu", price: 26 },

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
