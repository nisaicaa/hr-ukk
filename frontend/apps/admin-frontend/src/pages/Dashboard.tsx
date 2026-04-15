import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { handleError } from "../../../../services/handler/error";
import { getUser } from "../../../../services/helper/auth";
import {
  Users,
  Building2,
  Briefcase,
  Calendar,
  Wallet,
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

interface DashboardSummary {
  totalUsers: number;
  totalEmployees: number;
  totalDepartments: number;
  totalPositions: number;
  presentToday: number;
  leaveRequests: number;
  totalSalary: number;
}

interface DepartmentDistribution {
  name: string;
  total: number;
}

const DashboardAdmin = () => {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalUsers: 0,
    totalEmployees: 0,
    totalDepartments: 0,
    totalPositions: 0,
    presentToday: 0,
    leaveRequests: 0,
    totalSalary: 0,
  });

  const [monthlyAttendance, setMonthlyAttendance] = useState<number[]>([]);
  const [departmentDistribution, setDepartmentDistribution] = useState<
    DepartmentDistribution[]
  >([]);

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
      const data = res.data;

      setSummary(data.summary);
      setMonthlyAttendance(data.monthlyAttendance);
      setDepartmentDistribution(data.departmentDistribution);
    } catch (error) {
      console.error(handleError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#213448]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#213448]">
          Dashboard Admin
        </h1>
        <p className="text-slate-500">
          Selamat datang, {user?.name || "Administrator"}
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
  title="Total Pengguna"
  value={summary.totalUsers}
  icon={<Users />}
/>
        <StatCard
          title="Total Karyawan"
          value={summary.totalEmployees}
          icon={<Users />}
        />
        <StatCard
          title="Total Departemen"
          value={summary.totalDepartments}
          icon={<Building2 />}
        />
        <StatCard
          title="Total Posisi"
          value={summary.totalPositions}
          icon={<Briefcase />}
        />
        <StatCard
          title="Hadir Hari Ini"
          value={summary.presentToday}
          icon={<Calendar />}
        />
        <StatCard
          title="Pengajuan Cuti"
          value={summary.leaveRequests}
          icon={<Calendar />}
        />
        <StatCard
          title="Total Payroll"
          value={`Rp ${summary.totalSalary.toLocaleString("id-ID")}`}
          icon={<Wallet />}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LINE CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-4">Tren Kehadiran Tahunan</h3>
          <Line
            data={{
              labels: [
                "Jan","Feb","Mar","Apr","Mei","Jun",
                "Jul","Agu","Sep","Okt","Nov","Des",
              ],
              datasets: [
                {
                  label: "Kehadiran",
                  data: monthlyAttendance,
                  borderColor: "#213448",
                  backgroundColor: "rgba(33,52,72,0.1)",
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
            height={300}
          />
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-4">Distribusi Departemen</h3>
          <Pie
            data={{
              labels: departmentDistribution.map((d) => d.name),
              datasets: [
                {
                  data: departmentDistribution.map((d) => d.total),
                  backgroundColor: [
                    "#213448",
                    "#547792",
                    "#94B4C1",
                    "#B0C4DE",
                    "#78909C",
                  ],
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-[#213448]">{value}</h2>
    </div>
    <div className="text-[#547792]">{icon}</div>
  </div>
);

export default DashboardAdmin;