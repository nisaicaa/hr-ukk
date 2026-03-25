import { useState } from "react";
import apiClient from "../../../../services/api";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

// Warna lebih modern
const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"]; // Indigo, Hijau, Kuning, Merah

const AdminReport = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setGenerated(false);
      setError("");

      const res = await apiClient.get(`/reports/admin?month=${month}&year=${year}`);

      setData(res.data);
      setGenerated(true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message ||
        err.message ||
        "Gagal generate laporan.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data || !data.summary) {
      alert("Tidak ada data untuk export");
      return;
    }

    const sheetData = [
      {
        "Total Users": data.summary.totalUsers || 0,
        "Total Employees": data.summary.totalEmployees || 0,
        "Total Attendance": data.summary.totalAttendance || 0,
        "Total Payroll": data.summary.totalPayroll || 0,
        "Pending Leave": data.summary.pendingLeave || 0,
        "Approved Overtime": data.summary.approvedOvertime || 0,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Summary");

    XLSX.writeFile(
      workbook,
      `Admin_Global_Report_${month}_${year}.xlsx`
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Admin Global Report
          </h1>
          <p className="text-gray-500 mt-1">
            Monitoring keseluruhan sistem HRIS
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-100 p-3 px-5 rounded-full text-sm font-semibold text-gray-700">
            {new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* FILTER & ACTIONS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
            <input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <input
              type="number"
              min="2020"
              max="2030"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400"
          >
            {loading ? "Memuat..." : "Generate Report"}
          </button>
          
          <button
            onClick={handleExport}
            disabled={!generated || loading}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:bg-gray-400"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">⚠️</div>
          {error}
        </div>
      )}

      {/* NO DATA MESSAGE */}
      {!generated && !loading && !error && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Belum ada laporan</h3>
          <p className="text-sm">Silakan pilih periode lalu klik <span className="font-semibold text-indigo-600">Generate Report</span></p>
        </div>
      )}

      {/* REPORT DATA */}
      {generated && data && (
        <div className="space-y-8">
          {/* SUMMARY CARDS - REVISED */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {Object.entries(data.summary).map(([key, value], i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
                  {typeof value === 'number' ? value.toLocaleString("id-ID") : value}
                </h2>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PIE CHART */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-96">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                User Role Distribution
              </h2>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={data.usersByRole || []}
                    dataKey="total"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {data.usersByRole?.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* SUMMARY TABLE */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-96">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Key Metrics
              </h2>
              <div className="space-y-3 overflow-y-auto pr-2 h-72">
                {data.usersByRole?.map((roleData: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="font-semibold text-gray-800 text-sm">{roleData.role}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-indigo-700">
                        {roleData.total}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECENT LOGS */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Recent System Logs
            </h2>
            {(!data.recentLogs || data.recentLogs.length === 0) ? (
              <div className="text-center py-10 text-gray-500">
                <div className="text-4xl mb-2">📄</div>
                Tidak ada aktivitas terbaru.
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {data.recentLogs.map((log: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {log.user?.username || "System"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_at).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      <div className="text-sm bg-white p-3 rounded-lg border border-gray-100">
                        <span className="font-semibold text-indigo-700">Action:</span>{' '}
                        <span className="text-gray-700 font-mono text-xs">{log.action}</span>
                      </div>
                      {log.table_name && (
                        <div className="text-xs text-gray-500 mt-2">
                          Table: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{log.table_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReport;