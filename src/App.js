import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PosProvider } from './context/PosContext';
import { AuthProvider } from './components/Login';
import NewDigitalMenu from './components/NewDigitalMenu';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './components/AdminPanel';
import './App.css';
import './i18n'; // Import i18n configuration

const App = () => {
  return (
    <AuthProvider>
      <PosProvider>
        <Router>
          <Routes>
            {/* Public route - Digital Menu */}
            <Route path="/" element={<NewDigitalMenu />} />
            
            {/* Protected admin route */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route - redirect to home */}
            <Route path="*" element={<NewDigitalMenu />} />
          </Routes>
        </Router>
      </PosProvider>
    </AuthProvider>
  );
};

export default App;
