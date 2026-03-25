import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AccountSettings from './pages/AccountSettings';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import MyAttendance from './pages/MyAttendance';
import Leave from './pages/LeaveRequest';
import Overtime from './pages/OvertimeRequest';
import Payslip from './pages/Payslip';

function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-attendance" element={<MyAttendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/overtime" element={<Overtime />} />
            <Route path="/payslip" element={<Payslip />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default App

