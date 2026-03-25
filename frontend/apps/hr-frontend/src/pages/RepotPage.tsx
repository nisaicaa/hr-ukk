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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";

export default function HRReport() {
  const [month, setMonth] = useState(3);
  const [year, setYear] = useState(2026);
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(
        `/attendance/all?month=${month}&year=${year}`
      );
      setRawData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // 🔵 HITUNG STATISTIK DI FRONTEND
  // =============================

  const totalPresent = rawData.filter(
    (d) => d.attendance_status === "PRESENT"
  ).length;

  const totalLate = rawData.filter(
    (d) => d.attendance_status === "LATE"
  ).length;

  const totalAbsent = rawData.filter(
    (d) => d.attendance_status === "ABSENT"
  ).length;

  const totalEmployees = [
    ...new Set(rawData.map((d) => d.employee.full_name)),
  ].length;

  const totalRecords = rawData.length;

  const attendancePercentage =
    totalRecords > 0
      ? ((totalPresent / totalRecords) * 100).toFixed(1)
      : 0;

  // Chart Data
  const barData = [
    { name: "Hadir", value: totalPresent },
    { name: "Terlambat", value: totalLate },
    { name: "Alpha", value: totalAbsent },
  ];

  const pieData = [
    { name: "Hadir", value: totalPresent },
    { name: "Tidak Hadir", value: totalLate + totalAbsent },
  ];

  // Palet Warna Lebih Modern
  const COLORS = ["#10b981", "#ef4444"]; // Hijau, Merah
  const BAR_COLOR = "#3b82f6"; // Biru

  // =============================
  // 🔵 EXPORT EXCEL
  // =============================
  const exportExcel = () => {
    if (rawData.length === 0) return;
    
    const data = rawData.map((r, i) => ({
      No: i + 1,
      Nama: r.employee.full_name,
      Status: r.attendance_status,
      Tanggal: new Date(r.date).toLocaleDateString("id-ID", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    }));

    const sheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Laporan SDM");
    XLSX.writeFile(
      workbook,
      `Laporan_SDM_${month}_${year}.xlsx`
    );
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Laporan SDM Bulanan
          </h1>
          <p className="text-gray-500 mt-1">
            Statistik & Analitik Kehadiran Karyawan
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulan (Angka)</label>
            <input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={fetchReport}
            className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "Memuat..." : "Generate"}
          </button>
          <button
            onClick={exportExcel}
            disabled={rawData.length === 0}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:bg-gray-400"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card title="Total Karyawan" value={totalEmployees} color="text-blue-600" />
        <Card title="Total Hadir" value={totalPresent} color="text-emerald-600" />
        <Card title="Total Terlambat" value={totalLate} color="text-amber-600" />
        <Card title="Total Alpha" value={totalAbsent} color="text-red-600" />
      </div>

      {/* PERSENTASE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Persentase Kehadiran
        </h2>
        <div className="flex items-center gap-4">
            <div className="flex-grow bg-gray-100 h-6 rounded-full overflow-hidden border border-gray-200">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>
            <span className="text-2xl font-black text-emerald-600 w-20 text-right">
                {attendancePercentage}%
            </span>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Dari total <span className="font-semibold text-gray-700">{totalRecords}</span> data rekapan absensi bulan ini.
        </p>
      </div>

      {/* CHARTS */}
      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Statistik Kehadiran
          </h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f5f5f5'}} />
              <Bar dataKey="value" fill={BAR_COLOR} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
          <h2 className="mb-6 text-lg font-bold text-gray-900">
            Perbandingan Hadir / Tidak Hadir
          </h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie 
                data={pieData} 
                dataKey="value" 
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                label
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} stroke="none" />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* REKAP PER KARYAWAN */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-5">
          Rekapitulasi Kehadiran Karyawan
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left rounded-tl-lg">Nama Karyawan</th>
                <th className="p-4 text-center rounded-tr-lg">Total Hari Tercatat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...new Set(rawData.map(d => d.employee.full_name))].map((name, i) => {
                const total = rawData.filter(d => d.employee.full_name === name).length;
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{name}</td>
                    <td className="p-4 text-center font-bold text-lg text-blue-600">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rawData.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Tidak ada data. Silakan pilih bulan/tahun dan klik generate.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

function Card({ title, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h2 className={`text-3xl font-extrabold ${color} mt-1`}>{value}</h2>
    </div>
  );
}