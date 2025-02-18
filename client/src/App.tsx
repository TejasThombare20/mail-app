import React from 'react';
import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import  { AuthProvider } from './context/auth-context';
import Loginpage from './pages/login-page';
import Dashboard from './pages/Dashboard-page';

function App() {
  return (
<AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Loginpage />} />
    ā
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 Route */}
          <Route path="/dashboard" element={<Dashboard/>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
