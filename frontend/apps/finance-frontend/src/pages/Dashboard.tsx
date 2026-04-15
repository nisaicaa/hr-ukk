// src/pages/finance/dashboard/index.tsx
import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { handleError } from "../../../../services/handler/error";
import {
  CreditCard,
  UserCheck,
  Clock,
  AlertCircle,
  TrendingUp,
  Loader2,
  PieChart,
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
// TYPES
// =======================
interface Summary {
  totalPayroll: number;
  totalStaffPaid: number;
  totalPending: number;
  totalIssues: number;
  totalPayrollGenerated: number;
}

interface Employee {
  full_name: string;
  nik: string;
  departemen: string;
}

interface RecentPayroll {
  periode_month: number;
  periode_year: number;
  total_salary: number;
  employee: Employee;
}

interface DashboardResponse {
  summary: Summary;
  monthlyPayroll: number[];
  recentPayrolls: RecentPayroll[];
}

// =======================
// HELPER FUNCTIONS
// =======================
const formatIDR = (number: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);

const monthName = (month: number) =>
  new Date(0, month - 1).toLocaleString("id-ID", { month: "long" });

// =======================
// MAIN COMPONENT
// =======================
const FinanceDashboard = () => {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
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

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#547792]" size={48} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-slate-500">
        Data tidak tersedia.
      </div>
    );
  }

  const { summary, monthlyPayroll, recentPayrolls } = data;

  const stats = [
    {
      label: "Total Payroll",
      value: formatIDR(summary.totalPayroll),
      icon: CreditCard,
      color: "text-[#547792]",
      bg: "bg-[#94B4C1]/10",
    },
    {
      label: "Staff Terbayar",
      value: summary.totalStaffPaid,
      icon: UserCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Tertunda",
      value: summary.totalPending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Masalah",
      value: summary.totalIssues,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  const efficiencyRate = summary.totalPayrollGenerated
    ? (
        (summary.totalStaffPaid /
          summary.totalPayrollGenerated) *
        100
      ).toFixed(1)
    : "0";

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#213448] tracking-tight">
            Analitik <span className="text-[#547792]">Keuangan</span>
          </h1>
          <p className="text-slate-400 font-medium mt-1 italic text-sm md:text-base">
            Ringkasan performa keuangan dan payroll perusahaan.
          </p>
        </div>
        <div className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 self-start md:self-center">
          <div className="w-2.5 h-2.5 bg-[#547792] rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-[#213448] uppercase tracking-widest">
            Laporan Langsung
          </span>
        </div>
      </div>

      {/* STAT CARDS - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <div
            key={i}
            className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${item.bg} ${item.color}`}>
              <item.icon size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
              {item.label}
            </p>
            <h3 className="text-xl md:text-2xl font-black text-[#213448] truncate">
              {item.value}
            </h3>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LINE CHART */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-base md:text-lg font-black text-[#213448] mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#547792]" />
            Tren Payroll {new Date().getFullYear()}
          </h3>
          <div className="h-[250px] md:h-[320px]">
            <Line
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { ticks: { font: { size: 10 } } },
                  x: { ticks: { font: { size: 10 } } }
                }
              }}
              data={{
                labels: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"],
                datasets: [{
                  data: monthlyPayroll,
                  borderColor: "#213448",
                  backgroundColor: "rgba(84,119,146,0.1)",
                  fill: true,
                  tension: 0.4,
                  pointRadius: 4,
                  pointBackgroundColor: "#547792",
                }],
              }}
            />
          </div>
        </div>

        {/* PIE CHART CARD */}
        <div className="bg-[#213448] p-6 md:p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between">
          <div>
            <h3 className="text-sm md:text-base font-black mb-6 uppercase tracking-widest text-[#94B4C1] flex items-center gap-2">
              <PieChart size={18} /> Distribusi Status
            </h3>
            <div className="h-[200px] flex items-center justify-center">
              <Pie
                data={{
                  labels: ["Dibayar", "Tertunda", "Masalah"],
                  datasets: [{
                    data: [summary.totalStaffPaid, summary.totalPending, summary.totalIssues],
                    backgroundColor: ["#94B4C1", "#547792", "#E11D48"],
                    borderWidth: 0,
                  }],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: { color: '#fff', font: { size: 10 } }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-black text-[#94B4C1] uppercase tracking-[0.2em]">
              Tingkat Efisiensi
            </p>
            <p className="text-2xl md:text-3xl font-black mt-1">
              {efficiencyRate}%
            </p>
          </div>
        </div>
      </div>

      {/* RECENT PAYROLL TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-50">
          <h3 className="font-black text-[#213448] uppercase tracking-tight text-sm md:text-base">
            Aktivitas Payroll Terbaru
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/50">
                <th className="px-6 py-4">Periode</th>
                <th className="px-6 py-4">Karyawan</th>
                <th className="px-6 py-4">Departemen</th>
                <th className="px-6 py-4 text-right">Total Gaji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentPayrolls.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5 font-bold text-[#213448] text-sm">
                    {monthName(item.periode_month)} {item.periode_year}
                  </td>
                  <td className="px-6 py-5 text-sm">{item.employee.full_name}</td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-[#213448] rounded-lg text-[10px] font-bold uppercase">
                      {item.employee.departemen}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-[#547792] text-sm">
                    {formatIDR(item.total_salary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;