// src/pages/hr/dashboard/index.tsx
import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { handleError } from "../../../../services/handler/error";
import { getUser } from "../../../../services/helper/auth";
import {
  Users,
  Clock,
  Calendar,
  UserCheck,
  TrendingUp,
} from "lucide-react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler
);

// =======================
// INTERFACES
// =======================
interface DashboardSummary {
  totalEmployees: number;
  presentToday: number;
  leaveRequests: number;
  approvedOvertime: number;
}

interface ChartData {
  hadir: number;
  telat: number;
  cuti: number;
}

interface RecentLeave {
  name: string;
  position: string;
  type: string;
  duration: number;
  status: string;
}

interface DashboardResponse {
  summary: DashboardSummary;
  chart: ChartData;
  monthlyAttendance: number[];
  recentLeaves: RecentLeave[];
}

// =======================
// MAIN COMPONENT
// =======================
const Dashboard = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const user = getUser();
  const year = new Date().getFullYear();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/dashboard");
      setData(res.data);
    } catch (error) {
      console.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // LOADING STATE
  // =======================
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#547792]" />
          <p className="text-slate-500 font-medium animate-pulse">
            Menyiapkan Data HR...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // =======================
  // PIE CHART DATA
  // =======================
  const pieData = {
    labels: ["Hadir", "Cuti", "Telat"],
    datasets: [
      {
        data: [
          data.chart.hadir,
          data.chart.cuti,
          data.chart.telat,
        ],
        backgroundColor: ["#547792", "#94B4C1", "#213448"],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  };

  // =======================
  // LINE CHART DATA
  // =======================
  const lineData = {
    labels: [
      "Jan","Feb","Mar","Apr","Mei","Jun",
      "Jul","Agu","Sep","Okt","Nov","Des"
    ],
    datasets: [
      {
        label: "Total Hadir",
        data: data.monthlyAttendance,
        borderColor: "#213448",
        backgroundColor: "rgba(33, 52, 72, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  // =======================
  // RENDER
  // =======================
  return (
    <div className="p-2 lg:p-6 space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#213448] tracking-tight">
            SDM & Personalia
          </h1>
          <p className="text-slate-500 font-medium">
            Selamat datang, {user?.name || "Tim HR"}
          </p>
        </div>
        <div className="px-4 py-2 bg-[#94B4C1]/10 text-[#547792] rounded-xl text-sm font-bold border border-[#94B4C1]/20">
          Tahun Aktif: {year}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Karyawan"
          value={data.summary.totalEmployees}
          unit="Personil"
          icon={<Users size={24} />}
          color="text-[#213448]"
          bg="bg-[#94B4C1]/10"
        />
        <StatCard
          title="Hadir Hari Ini"
          value={data.summary.presentToday}
          unit="Orang"
          icon={<UserCheck size={24} />}
          color="text-[#547792]"
          bg="bg-[#547792]/10"
        />
        <StatCard
          title="Izin / Cuti"
          value={data.summary.leaveRequests}
          unit="Permohonan"
          icon={<Calendar size={24} />}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          title="Lembur Disetujui"
          value={data.summary.approvedOvertime}
          unit="Pengajuan"
          icon={<Clock size={24} />}
          color="text-slate-600"
          bg="bg-slate-100"
        />
      </div>

      {/* CHARTS & TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT LEAVES TABLE */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">
                Permohonan Cuti Terbaru
              </h3>
              <p className="text-xs text-slate-400">
                Menunggu persetujuan HR
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 font-bold">Nama</th>
                  <th className="px-6 py-4 font-bold">Tipe</th>
                  <th className="px-6 py-4 font-bold">Durasi</th>
                  <th className="px-6 py-4 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentLeaves.map((leave, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {leave.name}
                      <div className="text-xs text-slate-500">
                        {leave.position}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {leave.type}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {leave.duration} Hari
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          leave.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-700"
                            : leave.status === "REJECTED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">
              Rasio Absensi
            </h3>
            <div className="p-2 bg-slate-50 rounded-lg text-[#547792]">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="h-[250px]">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* LINE CHART */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h3 className="font-bold text-lg">
            Tren Kehadiran Tahunan
          </h3>
          <p className="text-sm text-slate-400">
            Statistik kehadiran karyawan per bulan di tahun {year}
          </p>
        </div>
        <div className="h-[300px]">
          <Line data={lineData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
};

// =======================
// STAT CARD COMPONENT
// =======================
const StatCard = ({
  title,
  value,
  unit,
  icon,
  color,
  bg,
}: any) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <h2 className="text-2xl lg:text-3xl font-black text-slate-800">
            {value.toLocaleString()}
          </h2>
          <span className="text-[10px] font-medium text-slate-400">
            {unit}
          </span>
        </div>
      </div>
      <div
        className={`p-3 lg:p-4 rounded-xl ${bg} ${color} transition-transform group-hover:rotate-6 duration-300`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default Dashboard;