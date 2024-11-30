import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import SalesSummary from "./components/SalesSummary";

const App = () => (
  <CartProvider>
    <Router>
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<><Menu /><Cart /></>} />
          <Route path="/sales" element={<SalesSummary />} />
        </Routes>
      </div>
    </Router>
  </CartProvider>
);

export default App;
