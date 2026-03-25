import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import AccountSettings from './pages/AccountSettings';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import AttendanceManagement from './pages/AttendanceManagement';
import LeaveManagement from './pages/LeaveManagement';
import OvertimeManagement from './pages/OvertimeManagement';
import ReportPage from './pages/RepotPage';

function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/leave" element={<LeaveManagement />} />
            <Route path="/overtime" element={<OvertimeManagement />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <></>
          </Route>
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default App;
