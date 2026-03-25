import { useEffect, useState } from 'react';
import apiClient from '../../../../services/api';
import { handleError } from '../../../../services/handler/error';
import { getUser } from '../../../../services/helper/auth';
import { 
  Users, 
  Clock, 
  Calendar, 
  UserCheck
} from 'lucide-react';

interface DashboardStats {
  // HR
  totalEmployees?: number;
  presentToday?: number;
  newHires?: number;
  leaveRequests?: number;
  // Admin
  totalUsers?: number;
  totalRoles?: number;
  activeUsers?: number;
  // Finance
  payrollTotal?: string;
  employeesPaid?: number;
  pendingPayroll?: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    newHires: 0,
    leaveRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const role = user?.role || 'HR';

  useEffect(() => {
    fetchDashboardData();
  }, [role]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (role === 'HR') {
        const res = await apiClient.get('/employees');
        const data = res.data?.data ?? res.data ?? [];
        const total = Array.isArray(data) ? data.length : 0;
        setStats({
          totalEmployees: total,
          presentToday: Math.floor(total * 0.95),
          newHires: 2,
          leaveRequests: 5,
        });
      } else if (role === 'ADMIN') {
        setStats({
          totalUsers: 12,
          totalRoles: 4,
          activeUsers: 11,
        });
      } else if (role === 'FINANCE') {
        setStats({
          payrollTotal: 'Rp 0',
          employeesPaid: 0,
          pendingPayroll: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', handleError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          <span className="text-sm font-medium text-slate-500">Memuat dashboard {role}...</span>
        </div>
      </div>
    );
  }

  const renderHRDashboard = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Selamat Datang di Portal HR</h1>
          <p className="text-sm text-slate-500">Ringkasan status sumber daya manusia hari ini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Karyawan" value={stats.totalEmployees} unit="Orang" icon={<Users className="text-emerald-600" size={20} />} color="bg-emerald-50" />
        <StatCard title="Hadir Hari Ini" value={stats.presentToday} unit="Orang" icon={<UserCheck className="text-blue-600" size={20} />} color="bg-blue-50" />
        <StatCard title="Permohonan Cuti" value={stats.leaveRequests} unit="Orang" icon={<Calendar className="text-amber-600" size={20} />} color="bg-amber-50" />
        <StatCard title="Lembur (Hari Ini)" value="12" unit="Jam" icon={<Clock className="text-violet-600" size={20} />} color="bg-violet-50" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">Permohonan Cuti Terbaru</h3>
          <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Lihat Semua</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Karyawan</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipe Cuti</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Budi Santoso', type: 'Cuti Tahunan', duration: '3 Hari', status: 'Pending' },
                { name: 'Siti Aminah', type: 'Cuti Sakit', duration: '1 Hari', status: 'Approved' },
                { name: 'Iwan Fals', type: 'Izin Alasan Penting', duration: '2 Hari', status: 'Processing' },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-bold text-slate-900">{item.name}</td>
                  <td className="p-4 text-sm text-slate-600">{item.type}</td>
                  <td className="p-4 text-sm text-slate-600">{item.duration}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      item.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return renderHRDashboard();
};

const StatCard = ({ title, value, unit, icon, color }: any) => (
  <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition group">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{value ?? 0}</span>
          {unit && <span className="text-[10px] font-bold text-slate-400 italic">{unit}</span>}
        </div>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

export default Dashboard;
