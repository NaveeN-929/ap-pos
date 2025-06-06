import React, { useState } from 'react';
import { PosProvider } from './context/PosContext';
import ProductMenu from './components/ProductMenu';
import Cart from './components/Cart';
import SalesDashboard from './components/SalesDashboard';
import './App.css';

const App = () => {
  const [currentView, setCurrentView] = useState('pos');

  const NavButton = ({ view, icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <PosProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-primary-600">
                  🏪 Aushadhapoorna POS
                </h1>
              </div>
              
              <div className="flex space-x-4">
                <NavButton
                  view="pos"
                  icon="🛒"
                  label="POS System"
                  isActive={currentView === 'pos'}
                  onClick={() => setCurrentView('pos')}
                />
                <NavButton
                  view="sales"
                  icon="📊"
                  label="Sales Dashboard"
                  isActive={currentView === 'sales'}
                  onClick={() => setCurrentView('sales')}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Products - Takes 2/3 of the space */}
              <div className="lg:col-span-2">
                <ProductMenu />
              </div>
              
              {/* Cart - Takes 1/3 of the space */}
              <div className="lg:col-span-1">
                <Cart />
              </div>
            </div>
          )}
          
          {currentView === 'sales' && <SalesDashboard />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-gray-500 text-sm">
              <p>Aushadhapoorna Medical Store • Point of Sale System</p>
              <p className="mt-1">Built with thermal printer support 🖨️</p>
            </div>
          </div>
        </footer>
      </div>
    </PosProvider>
  );
};

export default App;
