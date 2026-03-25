import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import AccountSettings from './pages/AccountSettings';
import AuthGuard from './components/AuthGuard';
import Layout from './components/Layout';
import LogActivityPage from './pages/LogActivity';
import ReportPage from './pages/RepotPage';

function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/account" element={<AccountSettings />} />
            <Route path="/logs" element={<LogActivityPage />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default App;
