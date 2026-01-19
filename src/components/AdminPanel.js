import React, { useState } from 'react';
import { useAuth } from './Login';
import ProductMenu from './ProductMenu';
import Cart from './Cart';
import SalesDashboard from './SalesDashboard';

const AdminPanel = () => {
  const [currentView, setCurrentView] = useState('pos');
  const { logout } = useAuth();

  const NavButton = ({ view, icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
        isActive
          ? 'bg-red-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-red-600">
                Aushadhapoorna POS Admin
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
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
              
              <div className="flex items-center space-x-2">
                <a 
                  href="/" 
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  View Menu
                </a>
                <span className="text-gray-300">|</span>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
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
            <p>Aushadhapoorna • Point of Sale System</p>
            <p className="mt-1">Built with thermal printer support 🖨️</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminPanel;