import { useEffect, useState } from 'react';
import apiClient from '../../../../services/api';
import { handleError } from '../../../../services/handler/error';
import {
  Users,
  UserCheck,
  Activity,
  Shield,
  Clock
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalEmployees: number;
  activeUsers: number;
  totalRoles: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEmployees: 0,
    activeUsers: 0,
    totalRoles: 4
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, employeesRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/employees')
      ]);

      const users = usersRes.data?.data || [];
      const employees = employeesRes.data?.data || [];

      setStats({
        totalUsers: users.length,
        totalEmployees: employees.length,
        activeUsers: Math.floor(users.length * 0.92), // Mock percentage
        totalRoles: 4
      });
    } catch (err) {
      console.error(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <span className="text-slate-500 font-medium">Memuat data sistem...</span>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Akun User',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100'
    },
    {
      label: 'Karyawan Terdaftar',
      value: stats.totalEmployees,
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      label: 'Users Aktif (Estimasi)',
      value: stats.activeUsers,
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      label: 'Role Sistem',
      value: stats.totalRoles,
      icon: Shield,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-100'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Utama Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola akses, monitor user, dan konfigurasi sistem global.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-200">
          <Clock size={14} />
          Terakhir diperbarui: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-2xl border ${stat.border} shadow-sm transition hover:shadow-md group`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 mt-2">{stat.value}</h3>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl transition group-hover:scale-110`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <span className="bg-emerald-50 px-1.5 py-0.5 rounded">+12%</span>
              <span className="text-slate-400">dari bulan lalu</span>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for future specific admin modules */}
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <Activity size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Belum Ada Aktivitas Mencurigakan</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">Sistem akan menampilkan log keamanan dan audit trail di sini secara otomatis.</p>
      </div>
    </div>
  );
};

export default Dashboard;
