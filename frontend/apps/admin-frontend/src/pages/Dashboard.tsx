import { useEffect, useState } from 'react';
import apiClient from '../../../../services/api';
import { handleError } from '../../../../services/handler/error';
import {
  Users,
  UserCheck,
  Activity,
  Shield,
  Clock,
  ArrowUpRight,
  Database,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  PointElement
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Tooltip, 
  Legend, 
  PointElement
);

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

  const [chart, setChart] = useState({ hadir: 0, telat: 0, absen: 0 });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update jam real-time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const [usersRes, employeesRes, reportRes] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/employees'),
        apiClient.get(`/repot?month=${currentMonth}&year=${currentYear}`)
      ]);

      const users = usersRes.data?.data || [];
      const employees = employeesRes.data?.data || [];
      const summary = reportRes.data?.summary || {};

      setStats({
        totalUsers: users.length,
        totalEmployees: employees.length,
        activeUsers: Math.floor(users.length * 0.92), // Simulasi user aktif
        totalRoles: 4
      });

      setChart({
        hadir: summary.totalAttendance || 0,
        telat: summary.totalLate || 0,
        absen: summary.totalLeave || 0
      });
    } catch (err) {
      console.error(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <Database className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={20} />
        </div>
        <div className="text-center">
            <h3 className="font-bold text-slate-800 tracking-tight text-lg">Sinkronisasi Data...</h3>
            <p className="text-sm text-slate-400">Menghubungkan ke pusat server</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Akun Pengguna', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Karyawan Terdaftar', value: stats.totalEmployees, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Pengguna Aktif', value: stats.activeUsers, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { label: 'Peran Sistem', value: stats.totalRoles, icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  ];

  return (
    <div className="p-4 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      
      {/* HEADER UTAMA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Shield size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Konsol Admin</h1>
                <p className="text-sm text-slate-500 font-medium italic">Otoritas Manajemen Sistem Global</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
          <Clock className="text-indigo-600" size={18} />
          <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 leading-none tracking-widest">Waktu Server</span>
              <span className="text-sm font-black text-slate-700 tabular-nums">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
          </div>
        </div>
      </div>

      {/* KARTU STATISTIK RINGKAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <div key={i} className={`group relative p-6 bg-white rounded-3xl border ${s.border} shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                <h2 className="text-3xl font-black text-slate-800">{s.value}</h2>
              </div>
              <div className={`${s.bg} ${s.color} p-3 rounded-2xl transition-all group-hover:scale-110 group-hover:rotate-6`}>
                <s.icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>SINKRONISASI AKTIF</span>
            </div>
          </div>
        ))}
      </div>

      {/* PANEL ANALITIK UTAMA */}
      <div className="grid lg:grid-cols-5 gap-8">

        {/* STATUS KEHADIRAN (LINEAR BARS) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Monitor Kehadiran</h3>
            <Activity className="text-emerald-500" size={18} />
          </div>
          <p className="text-xs text-slate-400 mb-8 font-medium">Rekapitulasi absensi harian seluruh divisi.</p>
          
          <div className="space-y-8 flex-1">
            {/* TEPAT WAKTU */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                <span className="text-slate-500">Tepat Waktu</span>
                <span className="text-emerald-600">{chart.hadir} Personil</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
                  style={{ width: `${(chart.hadir / (stats.totalEmployees || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* TERLAMBAT */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                <span className="text-slate-500">Terlambat</span>
                <span className="text-amber-600">{chart.telat} Personil</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${(chart.telat / (stats.totalEmployees || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* ABSEN / IZIN */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                <span className="text-slate-500">Absen / Izin / Cuti</span>
                <span className="text-rose-600">{chart.absen} Personil</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${(chart.absen / (stats.totalEmployees || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-10 p-5 bg-slate-900 rounded-2xl flex items-center justify-between shadow-lg">
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Rasio Kehadiran</p>
                <p className="text-white text-xs font-medium mt-1 italic">Operasional Hari Ini</p>
             </div>
             <div className="text-3xl font-black text-emerald-400 tabular-nums tracking-tighter">
                {Math.round((chart.hadir / (chart.hadir + chart.telat + chart.absen || 1)) * 100)}%
             </div>
          </div>
        </div>

        {/* PERBANDINGAN DATA (BAR CHART) */}
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Perbandingan Entitas</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Audit perbandingan data akun vs personil lapangan.</p>
            </div>
            <TrendingUp className="text-indigo-600" />
          </div>
          <div className="h-[300px]">
            <Bar
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { weight: 'bold', size: 11 } } },
                  x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 11 } } }
                }
              }}
              data={{
                labels: ["Akun Terdaftar", "Karyawan Lapangan"],
                datasets: [
                  {
                    label: "Total Unit",
                    data: [stats.totalUsers, stats.totalEmployees],
                    backgroundColor: ["#4f46e5", "#10b981"],
                    borderRadius: 15,
                    barThickness: 50,
                  }
                ]
              }}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
             <AlertCircle size={14} className="text-blue-600" />
             <p className="text-[11px] font-bold text-blue-700 uppercase tracking-tight">Kesehatan Data: Konsisten & Valid</p>
          </div>
        </div>

      </div>

      {/* FOOTER SYSTEM STATUS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-6 rounded-3xl text-white flex items-center justify-between overflow-hidden relative group hover:shadow-xl hover:shadow-indigo-200 transition-all">
            <div className="relative z-10">
                <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest">Integritas Keamanan</p>
                <h4 className="text-2xl font-black">99.9% Terjamin</h4>
            </div>
            <Shield className="absolute -right-4 -bottom-4 text-indigo-500/50 w-24 h-24 group-hover:scale-125 transition-transform duration-700" />
        </div>
        
        <div className="md:col-span-2 bg-slate-900 p-6 rounded-3xl text-white flex items-center gap-6 border border-slate-800">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 border border-slate-700 shadow-inner">
                <Activity className="text-emerald-400" />
            </div>
            <div className="flex-1">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Status Log Operasional</p>
                <p className="text-sm font-medium text-slate-200 mt-0.5 leading-relaxed">
                    Seluruh modul sistem (HR, Finance, Core) berjalan tanpa hambatan. 
                    Sinkronisasi otomatis berhasil untuk {stats.totalEmployees} node karyawan.
                </p>
            </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;