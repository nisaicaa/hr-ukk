import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { handleError } from "../../../../services/handler/error";
import { CreditCard, UserCheck, Clock, AlertCircle, TrendingUp } from "lucide-react";

// ✅ CHART imports tetap sama
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Filler // Tambahkan Filler untuk area chart
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

const Dashboard = () => {
  const [chart, setChart] = useState({ paid: 0, pending: 0, issues: 0 });
  const [monthly, setMonthly] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // Mapping warna untuk kemudahan maintenance
  const colorMap = {
    emerald: "from-emerald-500 to-teal-600",
    blue: "from-blue-500 to-indigo-600",
    amber: "from-amber-400 to-orange-500",
    rose: "from-rose-500 to-pink-600",
  };

  const stats = [
    { label: "Total Payroll", val: "Rp 1.2M", icon: CreditCard, color: "emerald", bg: "bg-emerald-50" },
    { label: "Staff Paid", val: chart.paid, icon: UserCheck, color: "blue", bg: "bg-blue-50" },
    { label: "Pending", val: chart.pending, icon: Clock, color: "amber", bg: "bg-amber-50" },
    { label: "Issues", val: chart.issues, icon: AlertCircle, color: "rose", bg: "bg-rose-50" },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const year = new Date().getFullYear();
      const promises = Array.from({ length: 12 }, (_, i) =>
        apiClient.get(`/repot?month=${i + 1}&year=${year}`)
      );
      const results = await Promise.all(promises);
      const monthlyData = results.map(r => r.data.summary?.totalAttendance || 0);
      setMonthly(monthlyData);

      const current = results[new Date().getMonth()].data.summary || {};
      setChart({
        paid: current.totalAttendance || 0,
        pending: current.totalLeave || 0,
        issues: current.totalLate || 0
      });
    } catch (err) {
      console.error(handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const getAnalytics = () => {
    const total = chart.paid + chart.pending + chart.issues;
    if (total === 0) return { percent: 0, status: "No Data", color: "text-slate-400", bg: "bg-slate-50" };
    
    const percent = Math.round((chart.paid / total) * 100);
    if (percent >= 90) return { percent, status: "Healthy", color: "text-emerald-600", bg: "bg-emerald-50" };
    if (percent >= 75) return { percent, status: "Warning", color: "text-amber-600", bg: "bg-amber-50" };
    return { percent, status: "Critical", color: "text-rose-600", bg: "bg-rose-50" };
  };

  const analytics = getAnalytics();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading Financial Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back! Here's what's happening with payroll today.
          </p>
        </div>
        <div className="px-4 py-2 bg-white border rounded-xl shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600">Live System Status</span>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <div key={i} className="group bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${item.bg}`}>
              <item.icon className={item.color === 'emerald' ? 'text-emerald-600' : item.color === 'blue' ? 'text-blue-600' : item.color === 'amber' ? 'text-amber-600' : 'text-rose-600'} size={24} />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{item.label}</p>
            <h3 className="text-3xl font-black text-slate-800">{item.val}</h3>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LINE CHART - Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Payroll Trends</h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg focus:ring-0 text-slate-500 font-medium">
                <option>Year 2026</option>
            </select>
          </div>
          <div className="h-[300px]">
            <Line
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { border: { display: false }, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
              }}
              data={{
                labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                datasets: [{
                  label: "Processed",
                  data: monthly,
                  borderColor: "#2563eb",
                  backgroundColor: "rgba(37, 99, 235, 0.1)",
                  fill: true,
                  tension: 0.4, // Membuat garis melengkung
                  pointRadius: 4,
                  pointBackgroundColor: "#fff",
                  pointBorderWidth: 2,
                }]
              }}
            />
          </div>
        </div>

        {/* PIE CHART - Analytics */}
        <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Distribution</h3>
          <div className="flex-1 flex items-center justify-center">
            <Pie
              options={{ plugins: { legend: { position: 'bottom' } } }}
              data={{
                labels: ["Paid", "Pending", "Issues"],
                datasets: [{
                  data: [chart.paid, chart.pending, chart.issues],
                  backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
                  borderWidth: 0,
                }]
              }}
            />
          </div>
          
          <div className={`mt-6 p-4 rounded-2xl ${analytics.bg} border border-white flex items-center justify-between`}>
             <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Status Kesehatan</p>
                <p className={`font-black ${analytics.color}`}>{analytics.status}</p>
             </div>
             <div className="text-right">
                <p className="text-2xl font-black text-slate-800">{analytics.percent}%</p>
             </div>
          </div>
        </div>

      </div>

      {/* TABLE - Recent Activity */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Payroll Activity</h3>
          <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-8 py-4">Periode</th>
                <th className="px-8 py-4">Total Amount</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5 font-bold text-slate-700">Februari 2026</td>
                <td className="px-8 py-5 text-slate-600 font-medium">Rp 450.000.000</td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    Completed
                  </span>
                </td>
                <td className="px-8 py-5 text-right">
                    <button className="text-slate-400 hover:text-slate-600 font-medium text-sm">Details</button>
                </td>
              </tr>
              {/* Tambahkan dummy row lain jika perlu */}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;