import { useState } from "react";
import apiClient from "../../../..//services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Download, FileText, BriefcaseBusiness, TrendingUp, Users } from "lucide-react";
import * as XLSX from "xlsx";

const Report = () => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `/reports/finance?month=${month}&year=${year}`
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ✅ FRONTEND EXPORT EXCEL
  // ===============================
  const handleExport = () => {
    if (!data || !data.employeeRecap) return;

    const excelData = data.employeeRecap.map((emp: any, i: number) => ({
      No: i + 1,
      Nama: emp.name,
      Kehadiran: emp.attendance,
      "Total Lembur (Menit)": emp.overtime,
      Gaji: emp.salary,
      "Status Slip": emp.payslipReady ? "Generated" : "Not Ready",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Payroll");

    XLSX.writeFile(
      workbook,
      `Laporan_Payroll_${month}_${year}.xlsx`
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Laporan Payroll Bulanan
          </h1>
          <p className="text-gray-500 mt-1">
            Rekapitulasi penggajian karyawan berdasarkan periode.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-gray-100 p-3 px-5 rounded-full text-sm font-semibold text-gray-700">
          {new Date(year, month - 1).toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* FILTER & ACTIONS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={handleGenerate}
            className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            {loading ? "Memuat..." : "Generate Report"}
          </button>

          {data && (
            <button
              onClick={handleExport}
              disabled={!data.employeeRecap?.length}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:bg-gray-400"
            >
              <Download size={18} />
              Export Excel
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card 
            title="Total Payroll" 
            value={`Rp ${data.summary.totalPayrollAmount.toLocaleString("id-ID")}`}
            icon={<TrendingUp className="text-indigo-600" />}
          />
          <Card 
            title="Total Potongan" 
            value={`Rp ${data.summary.totalDeductions.toLocaleString("id-ID")}`}
            icon={<FileText className="text-red-600" />}
          />
          <Card 
            title="Karyawan Digaji" 
            value={data.summary.totalEmployeesPaid}
            icon={<Users className="text-blue-600" />}
          />
          <Card 
            title="Total Lembur (Menit)" 
            value={data.summary.totalOvertimeMinutes}
            icon={<BriefcaseBusiness className="text-amber-600" />}
          />
        </div>
      )}

      {/* CHART */}
      {data && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Grafik Gaji Per Karyawan
          </h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={data.employeeRecap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="salary" fill="#6366F1" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* TABLE */}
      {data && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Rekap Payroll Karyawan
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr className="text-left">
                  <th className="p-4">Nama Karyawan</th>
                  <th className="p-4 text-center">Kehadiran</th>
                  <th className="p-4 text-center">Lembur</th>
                  <th className="p-4 text-center">Gaji</th>
                  <th className="p-4 text-center">Slip Gaji</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.employeeRecap.map((emp: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{emp.name}</td>
                    <td className="p-4 text-center">{emp.attendance}</td>
                    <td className="p-4 text-center">{emp.overtime}</td>
                    <td className="p-4 text-center font-bold text-indigo-700">
                      Rp {emp.salary.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 text-center">
                      {emp.payslipReady ? "Generated" : "Not Ready"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

function Card({ title, value, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="p-4 rounded-full bg-gray-100">
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h2 className="text-2xl font-extrabold text-gray-900 mt-1">
          {value}
        </h2>
      </div>
    </div>
  );
}

export default Report;