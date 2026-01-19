import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import thermalPrinter from '../utils/thermalPrinter';

const Cart = () => {
  const { 
    cart, 
    cartTotal, 
    cartItemCount, 
    businessInfo,
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    completeSale 
  } = usePos();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [printStatus, setPrintStatus] = useState('');

  // Calculate taxes and totals
  const subtotal = cartTotal;
  const cgstRate = 0.025; // 2.5%
  const sgstRate = 0.025; // 2.5%
  const cgst = subtotal * cgstRate;
  const sgst = subtotal * sgstRate;
  const total = subtotal + cgst + sgst;
  const roundedTotal = Math.round(total);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateCartQuantity(id, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create receipt data
      const receiptData = {
        businessName: businessInfo.name,
        address: businessInfo.address,
        gst: businessInfo.gst,
        items: cart,
        subtotal: subtotal,
        cgst: cgst,
        sgst: sgst,
        total: roundedTotal
      };

      // Complete sale in state
      completeSale(receiptData);
      
      // Print receipt
      console.log('🖨️ Printing receipt...');
      await printReceipt(receiptData);
      
      alert('✅ Sale completed and receipt printed successfully!');
      clearCart();
    } catch (error) {
      console.error('❌ Sale processing failed:', error);
      alert(`Sale processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const printReceipt = async (receiptData) => {
    try {
      setPrintStatus('Connecting to cat printer...');
      
      await thermalPrinter.printReceipt(receiptData);
      setPrintStatus('Thank You !');
    } catch (error) {
      console.error('Print failed:', error);
      setPrintStatus(`Print failed: ${error.message}`);
    }
  };

  const testPrint = async () => {
    try {
      setPrintStatus('Testing cat printer...');
      await thermalPrinter.testPrint();
      setPrintStatus('Test print completed! ✅');
    } catch (error) {
      console.error('Test print failed:', error);
      setPrintStatus(`Test failed: ${error.message}`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Cart</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-6xl mb-4">🛒</div>
          <p>Your cart is empty</p>
          <p className="text-sm">Add some products to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Cart ({cartItemCount} items)</h2>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-6">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-600">₹{item.price.toFixed(2)} each</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  -
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                >
                  +
                </button>
              </div>
              
              <div className="text-right">
                <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
              
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 hover:text-red-800 ml-4"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal:</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>CGST (2.5%):</span>
          <span>₹{cgst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>SGST (2.5%):</span>
          <span>₹{sgst.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
          <span>Total:</span>
          <span>₹{roundedTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <button
          onClick={() => setShowPreview(true)}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
        >
          Preview Receipt
        </button>
        
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isProcessing ? '🔄 Processing...' : '🖨️ Print Receipt & Checkout'}
        </button>
        
        <button
          onClick={testPrint}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          🧪 Test Printer
        </button>
      </div>

      {/* Receipt Preview Modal */}
      {showPreview && (
        <ReceiptPreview
          businessInfo={businessInfo}
          items={cart}
          subtotal={subtotal}
          cgst={cgst}
          sgst={sgst}
          total={roundedTotal}
          onClose={() => setShowPreview(false)}
          onPrint={handleCheckout}
          isProcessing={isProcessing}
          printStatus={printStatus}
        />
      )}
    </div>
  );
};

// Receipt Preview Component
const ReceiptPreview = ({ businessInfo, items, subtotal, cgst, sgst, total, onClose, onPrint, isProcessing, printStatus }) => {
  const now = new Date();
  
  const handleBrowserPrint = () => {
    const printContent = document.getElementById('receipt-content').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    document.body.classList.add('print-receipt');
    window.print();
    document.body.innerHTML = originalContent;
    document.body.classList.remove('print-receipt');
    
    // Reload the page to restore React functionality
    window.location.reload();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Receipt Preview</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          {/* Receipt Content */}
          <div id="receipt-content" className="border p-4 rounded bg-gray-50 font-mono text-sm print-receipt">
            <div className="text-center mb-4">
              <h4 className="font-bold">{businessInfo.name}</h4>
              <p>{businessInfo.address}</p>
              <p>GST: {businessInfo.gst}</p>
              <p>{now.toLocaleDateString()} {now.toLocaleTimeString()}</p>
            </div>
            
            <div className="border-t border-b py-2 mb-2">
              {items.map((item, index) => {
                const maxNameLength = 18;
                const displayName = item.name.length > maxNameLength ? 
                  item.name.substring(0, maxNameLength) + '...' : item.name;
                
                return (
                  <div key={index} className="mb-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span>{displayName}</span>
                      <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-xs">
                      <span>Qty: {item.quantity}</span>
                      <span>@ Rs.{item.price.toFixed(2)} each</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs.{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (2.5%):</span>
                <span>Rs.{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (2.5%):</span>
                <span>Rs.{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>TOTAL:</span>
                <span>Rs.{total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p>{printStatus}</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3 mt-6">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={handleBrowserPrint}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                🖨️ Browser Print
              </button>
            </div>
            <button
              onClick={onPrint}
              disabled={isProcessing}
              className={`w-full py-2 px-4 rounded-lg text-white ${
                isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isProcessing ? 'Printing...' : '🖨️ Thermal Print & Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 