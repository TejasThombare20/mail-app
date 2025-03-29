import React from 'react';
import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import  { AuthProvider } from './context/auth-context';
import Loginpage from './pages/login-page';
import DashboardPage from './pages/Dashboard-page';
import SendEmailForm from './components/Send-Email-form';
import Dashboard from './components/Dashboard';
import TemplateList from './pages/Templates-page';
import Templatepage from './pages/Template-page';
import AttachmentPage from './pages/Attachments-page';
import HistoryPage from './pages/History-page';

function App() {
  return (
<AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Loginpage />} />
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path='/dashboard' element={<DashboardPage/>}>
          <Route index element={<Dashboard />} />
          <Route path="send" element={<SendEmailForm />} />
          <Route path="templates" element={<TemplateList />} />
          <Route path="templates/:templateId?" element={<Templatepage/>} />
          <Route path="attachments" element={<AttachmentPage/>} />
          <Route path="history" element={<HistoryPage/>} />

          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
