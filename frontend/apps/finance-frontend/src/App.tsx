import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';
import Payroll from './pages/PayrollManagement';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import ReportPage from './pages/RepotPage';

function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default App

