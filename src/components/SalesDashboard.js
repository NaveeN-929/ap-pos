import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import ExcelJS from 'exceljs';

const SalesDashboard = () => {
  const { sales, dailySales, dailyTotal, businessInfo } = usePos();
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Filter sales by selected date
  const filteredSales = sales.filter(sale => sale.date === selectedDate);
  const selectedDateTotal = filteredSales.reduce((total, sale) => total + sale.total, 0);

  // Get unique dates
  const uniqueDates = [...new Set(sales.map(sale => sale.date))].sort().reverse();

  // Calculate statistics
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((total, sale) => total + sale.total, 0);
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Export to Excel function
  const exportToExcel = async () => {
    let dataToExport = sales;

    // Filter by date range if specified
    if (exportStartDate && exportEndDate) {
      const startDate = new Date(exportStartDate);
      const endDate = new Date(exportEndDate);
      
      dataToExport = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
      });
    }

    if (dataToExport.length === 0) {
      alert('No sales found for the selected date range.');
      return;
    }

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    // Add header row
    const headers = [
      'Sale ID',
      'Date',
      'Time',
      'Item Name',
      'Quantity',
      'Unit Price',
      'Item Total',
      'Subtotal',
      'CGST',
      'SGST',
      'Total'
    ];

    worksheet.addRow(headers);

    // Style the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    // Add sales data
    dataToExport.forEach(sale => {
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach((item, index) => {
          const itemTotal = (item.price || 0) * (item.quantity || 0);
          worksheet.addRow([
            sale.id || '',
            sale.date || '',
            sale.time || '',
            item.name || '',
            item.quantity || 0,
            item.price || 0,
            itemTotal,
            index === 0 ? (sale.subtotal || 0) : '', // Only show subtotal on first item
            index === 0 ? (sale.cgst || 0) : '',     // Only show cgst on first item
            index === 0 ? (sale.sgst || 0) : '',     // Only show sgst on first item
            index === 0 ? (sale.total || 0) : ''     // Only show total on first item
          ]);
        });
      } else {
        // If no items, add a row with sale totals only
        worksheet.addRow([
          sale.id || '',
          sale.date || '',
          sale.time || '',
          'No items',
          0,
          0,
          0,
          sale.subtotal || 0,
          sale.cgst || 0,
          sale.sgst || 0,
          sale.total || 0
        ]);
      }
    });

    // Auto-size columns
    worksheet.columns = [
      { width: 12 }, // Sale ID
      { width: 12 }, // Date
      { width: 12 }, // Time
      { width: 25 }, // Item Name
      { width: 10 }, // Quantity
      { width: 12 }, // Unit Price
      { width: 12 }, // Item Total
      { width: 12 }, // Subtotal
      { width: 10 }, // CGST
      { width: 10 }, // SGST
      { width: 12 }  // Total
    ];

    // Generate filename
    const dateRange = exportStartDate && exportEndDate 
      ? `_${exportStartDate}_to_${exportEndDate}` 
      : `_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    const filename = `sales_report${dateRange}.xlsx`;

    // Save file
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      
      alert(`Sales report exported successfully as ${filename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error occurred while exporting to Excel. Please try again.');
    }
  };

  // Clear local storage function
  const handleClearStorage = () => {
    setShowClearModal(true);
  };

  const confirmClearStorage = () => {
    if (deleteConfirmText === 'Delete') {
      localStorage.clear();
      setShowClearModal(false);
      setDeleteConfirmText('');
      alert('Local storage cleared successfully! Please refresh the page.');
      window.location.reload();
    } else {
      alert('Please type "Delete" exactly to confirm.');
    }
  };

  const cancelClearStorage = () => {
    setShowClearModal(false);
    setDeleteConfirmText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sales Dashboard</h1>
        <p className="text-gray-600">{businessInfo.name}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Today's Sales</h3>
          <p className="text-3xl font-bold">{dailySales.length}</p>
          <p className="text-blue-100">transactions</p>
        </div>

        <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Today's Revenue</h3>
          <p className="text-3xl font-bold">₹{dailyTotal.toFixed(2)}</p>
          <p className="text-green-100">total earnings</p>
        </div>

        <div className="card bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</p>
          <p className="text-emerald-100">all time earnings</p>
        </div>

        <div className="card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
          <p className="text-3xl font-bold">{totalSales}</p>
          <p className="text-purple-100">all time</p>
        </div>

        <div className="card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <h3 className="text-lg font-semibold mb-2">Average Sale</h3>
          <p className="text-3xl font-bold">₹{averageSale.toFixed(2)}</p>
          <p className="text-orange-100">per transaction</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Export Sales Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <button
              onClick={exportToExcel}
              disabled={sales.length === 0}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                sales.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              📊 Export to Excel
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Leave date fields empty to export all sales data.
        </p>
      </div>

      {/* Sales Filter */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Sales History</h2>
          
          <div className="flex items-center space-x-4">
            <label className="text-gray-700 font-medium">Filter by date:</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field w-auto"
            >
              <option value="">All dates</option>
              {uniqueDates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedDate && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">
                Sales for {selectedDate}: {filteredSales.length} transactions
              </span>
              <span className="font-bold text-primary-600">
                Total: ₹{selectedDateTotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Sales List */}
        <div className="space-y-4">
          {(selectedDate ? filteredSales : sales.slice(0, 10)).map(sale => (
            <SaleItem key={sale.id} sale={sale} />
          ))}
        </div>

        {sales.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p>No sales recorded yet</p>
            <p className="text-sm">Start making sales to see them here</p>
          </div>
        )}

        {!selectedDate && sales.length > 10 && (
          <div className="text-center mt-6">
            <p className="text-gray-500">Showing latest 10 sales</p>
          </div>
        )}
      </div>

      {/* Clear Local Storage Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Management</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-red-600 text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Clear All Data</h3>
              <p className="text-red-700 mb-4">
                This will permanently delete all sales data, inventory, and settings from local storage. 
                This action cannot be undone.
              </p>
              <button
                onClick={handleClearStorage}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                🗑️ Clear Local Storage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Storage Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-red-600 text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Data Deletion</h3>
              <p className="text-gray-600 mb-4">
                This will permanently delete all your sales data, inventory, and settings. 
                This action cannot be undone.
              </p>
              <p className="text-sm text-gray-700 mb-4">
                To confirm, please type <strong>"Delete"</strong> in the field below:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type 'Delete' to confirm"
                className="input-field w-full mb-4"
                autoFocus
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={cancelClearStorage}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearStorage}
                disabled={deleteConfirmText !== 'Delete'}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                  deleteConfirmText === 'Delete'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Individual Sale Item Component
const SaleItem = ({ sale }) => {
  const [expanded, setExpanded] = useState(false);

  // Ensure sale has required properties with defaults
  const saleData = {
    id: sale.id || 'N/A',
    date: sale.date || 'N/A',
    time: sale.time || 'N/A',
    items: sale.items || [],
    total: sale.total || 0,
    subtotal: sale.subtotal || 0,
    cgst: sale.cgst || 0,
    sgst: sale.sgst || 0
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <span className="font-semibold text-gray-800">Sale #{saleData.id}</span>
            <span className="text-sm text-gray-500">{saleData.date} at {saleData.time}</span>
          </div>
          
          <div className="text-sm text-gray-600">
            {saleData.items.length} item(s) • Total: ₹{saleData.total.toFixed(2)}
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-primary-600 hover:text-primary-800 font-medium text-sm"
        >
          {expanded ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2">Items:</h4>
          <div className="space-y-2">
            {saleData.items.length > 0 ? (
              saleData.items.map((item, index) => {
                // Calculate item total from price and quantity
                const itemTotal = (item.price || 0) * (item.quantity || 0);
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name || 'Unknown Item'} x {item.quantity || 0}</span>
                    <span>₹{itemTotal.toFixed(2)}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-gray-500">No items found</div>
            )}
          </div>
          
          <div className="mt-4 pt-2 border-t border-gray-100 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{saleData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST (2.5%):</span>
              <span>₹{saleData.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST (2.5%):</span>
              <span>₹{saleData.sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t">
              <span>Total:</span>
              <span>₹{saleData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard; 