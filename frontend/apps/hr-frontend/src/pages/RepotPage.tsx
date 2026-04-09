import { useState } from "react";
import apiClient from "../../../../services/api";
import * as XLSX from "xlsx";
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  Search,
  Download,
  Database,
  Briefcase,
  AlertCircle,
  Loader2
} from "lucide-react";

interface HRRow {
  name: string;
  department: string;
  position: string;
  attendance: number;
  late: number;
  leave: number;
  overtime: number;
}

interface HRSummary {
  totalEmployees: number;
  totalAttendance: number;
  totalLate: number;
  totalLeave: number;
  totalOvertime: number;
}

export default function HRReport() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [tableData, setTableData] = useState<HRRow[]>([]);
  const [summary, setSummary] = useState<HRSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      // Perbaikan typo: /repot -> /report
      const res = await apiClient.get(`/report?month=${month}&year=${year}`);
      setTableData(res.data.table || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      console.error("Gagal mengambil laporan HR", err);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (tableData.length === 0) return;

    const data = tableData.map((r, i) => ({
      No: i + 1,
      Nama: r.name,
      Departemen: r.department,
      Posisi: r.position,
      Hadir: r.attendance,
      Telat: r.late,
      Cuti: r.leave,
      Lembur: r.overtime,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HR Report");
    XLSX.writeFile(wb, `HR_Report_${month}_${year}.xlsx`);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Users size={24} />
              </div>
              HR Intelligence Report
            </h1>
            <p className="text-slate-500 mt-1 ml-11">Monitoring performa dan kehadiran karyawan secara real-time.</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full text-slate-600 font-medium self-start md:self-center">
            <Calendar size={18} className="text-indigo-600" />
            {new Date(year, month - 1).toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Bulan</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-48"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Tahun</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-slate-200 p-2.5 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all w-32"
            />
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              Generate
            </button>

            <button
              onClick={exportExcel}
              disabled={tableData.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Excel
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            <StatCard label="Total Staff" value={summary.totalEmployees} icon={<Users />} color="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Hadir" value={summary.totalAttendance} icon={<UserCheck />} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard label="Terlambat" value={summary.totalLate} icon={<Clock />} color="text-amber-600" bg="bg-amber-50" />
            <StatCard label="Cuti" value={summary.totalLeave} icon={<AlertCircle />} color="text-rose-600" bg="bg-rose-50" />
            <StatCard label="Lembur" value={summary.totalOvertime} icon={<Briefcase />} color="text-indigo-600" bg="bg-indigo-50" />
          </div>
        )}

        {/* DATA TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600">No</th>
                  <th className="p-4 font-semibold text-slate-600">Karyawan</th>
                  <th className="p-4 font-semibold text-slate-600">Departemen</th>
                  <th className="p-4 font-semibold text-slate-600 text-center">Hadir</th>
                  <th className="p-4 font-semibold text-slate-600 text-center text-amber-600">Telat</th>
                  <th className="p-4 font-semibold text-slate-600 text-center text-rose-600">Cuti</th>
                  <th className="p-4 font-semibold text-slate-600 text-center text-indigo-600">Lembur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableData.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500 text-sm">{i + 1}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-900">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.position}</div>
                    </td>
                    <td className="p-4 text-slate-600">{r.department}</td>
                    <td className="p-4 text-center font-semibold text-slate-700">{r.attendance}</td>
                    <td className="p-4 text-center font-semibold text-amber-600 bg-amber-50/30">{r.late}</td>
                    <td className="p-4 text-center font-semibold text-rose-600">{r.leave}</td>
                    <td className="p-4 text-center font-semibold text-indigo-600">{r.overtime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tableData.length === 0 && !loading && (
            <div className="p-20 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Database className="text-slate-300" size={40} />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Belum Ada Data</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-1">
                Silakan pilih periode dan klik tombol Generate untuk menarik laporan.
              </p>
            </div>
          )}

          {loading && (
             <div className="p-20 text-center flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                <p className="text-slate-500">Menyusun laporan...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen StatCard yang ditingkatkan
function StatCard({ label, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:scale-[1.02]">
      <div className={`p-3 ${bg} ${color} rounded-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-slate-800">{value.toLocaleString()}</h3>
      </div>
    </div>
  );
}