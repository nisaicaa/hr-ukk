import { useEffect, useState } from 'react';
import apiClient from '../../../../services/api';
import { handleError } from '../../../../services/handler/error';
import { getUser } from '../../../../services/helper/auth';
import { 
  Users, 
  Clock, 
  Calendar, 
  UserCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, LineElement, PointElement, Filler
);

interface DashboardStats {
  totalEmployees?: number;
  presentToday?: number;
  newHires?: number;
  leaveRequests?: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentToday: 0,
    newHires: 0,
    leaveRequests: 0,
  });

  const [chart, setChart] = useState({ hadir: 0, cuti: 0, telat: 0 });
  const [monthly, setMonthly] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const user = getUser();
  const year = new Date().getFullYear();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/employees');
      const data = res.data?.data ?? res.data ?? [];
      const total = Array.isArray(data) ? data.length : 0;

      const promises = Array.from({ length: 12 }, (_, i) =>
        apiClient.get(`/repot?month=${i + 1}&year=${year}`)
      );
      const results = await Promise.all(promises);
      
      const monthlyData = results.map(r => r.data.summary?.totalAttendance || 0);
      setMonthly(monthlyData);

      const current = results[new Date().getMonth()].data.summary || {};
      
      setStats({
        totalEmployees: total,
        presentToday: current.totalAttendance || 0,
        newHires: 2,
        leaveRequests: current.totalLeave || 0,
      });

      setChart({
        hadir: current.totalAttendance || 0,
        cuti: current.totalLeave || 0,
        telat: current.totalLate || 0
      });
    } catch (error) {
      console.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-200 border-t-emerald-600" />
          <p className="text-slate-500 font-medium animate-pulse">Menyiapkan Data HR...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 lg:p-4 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">SDM & Personalia</h1>
          <p className="text-slate-500 font-medium">Selamat datang, {user?.name || 'HR Team'}</p>
        </div>
        <div className="flex gap-2">
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">
                Tahun Aktif: {year}
            </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Karyawan" 
            value={stats.totalEmployees} 
            unit="Personil" 
            icon={<Users size={24} />} 
            color="text-emerald-600" 
            bg="bg-emerald-50" 
        />
        <StatCard 
            title="Hadir Hari Ini" 
            value={stats.presentToday} 
            unit="Orang" 
            icon={<UserCheck size={24} />} 
            color="text-blue-600" 
            bg="bg-blue-50" 
        />
        <StatCard 
            title="Izin / Cuti" 
            value={stats.leaveRequests} 
            unit="Request" 
            icon={<Calendar size={24} />} 
            color="text-amber-600" 
            bg="bg-amber-50" 
        />
        <StatCard 
            title="Lembur" 
            value="12" 
            unit="Jam" 
            icon={<Clock size={24} />} 
            color="text-violet-600" 
            bg="bg-violet-50" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* TABLE SECTION */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
                <h3 className="font-bold text-slate-800">Permohonan Cuti Terbaru</h3>
                <p className="text-xs text-slate-400">Menunggu persetujuan HR</p>
            </div>
            <button className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                Lihat Semua
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 font-bold">Nama Karyawan</th>
                  <th className="px-6 py-4 font-bold">Tipe</th>
                  <th className="px-6 py-4 font-bold">Durasi</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">B</div>
                        <span className="font-bold text-slate-700">Budi Santoso</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">Cuti Tahunan</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">3 Hari</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                      Pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Rasio Absensi</h3>
            <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><TrendingUp size={16}/></div>
          </div>
          <div className="aspect-square relative">
            <Pie
              options={{ 
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } },
                maintainAspectRatio: false
              }}
              data={{
                labels: ["Hadir", "Cuti", "Telat"],
                datasets: [{
                  data: [chart.hadir, chart.cuti, chart.telat],
                  backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                  borderWidth: 0,
                  hoverOffset: 15
                }]
              }}
            />
          </div>
        </div>

      </div>

      {/* LINE CHART */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-slate-800">
        <div className="mb-6">
            <h3 className="font-bold text-lg">Trend Kehadiran Tahunan</h3>
            <p className="text-sm text-slate-400">Statistik kehadiran karyawan per bulan di tahun {year}</p>
        </div>
        <div className="h-[300px]">
          <Line
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } },
                x: { grid: { display: false } }
              }
            }}
            data={{
              labels: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"],
              datasets: [{
                label: "Total Hadir",
                data: monthly,
                borderColor: "#059669",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 8,
                pointBackgroundColor: "#fff",
                pointBorderWidth: 3
              }]
            }}
          />
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ title, value, unit, icon, color, bg }: any) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <div className="flex items-baseline gap-1">
            <h2 className="text-3xl font-black text-slate-800">{value}</h2>
            <span className="text-xs font-medium text-slate-400">{unit}</span>
        </div>
      </div>
      <div className={`p-4 rounded-xl ${bg} ${color} transition-transform group-hover:scale-110 duration-300`}>
        {icon}
      </div>
    </div>
  </div>
);

export default Dashboard;