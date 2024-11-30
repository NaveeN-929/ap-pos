import React, { useState, useEffect } from "react";
import { getSales } from "../db/indexedDB";

const SalesSummary = () => {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      const allSales = await getSales();
      setSales(allSales);
    };
    fetchSales();
  }, []);

  const dailyTotal = sales
    .filter((sale) => new Date(sale.date).toDateString() === new Date().toDateString())
    .reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div>
      <h2>Daily Total: ₹{dailyTotal}</h2>
      <ul>
        {sales.map((sale) => (
          <li key={sale.id}>
            {sale.date} - ₹{sale.total}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SalesSummary;
