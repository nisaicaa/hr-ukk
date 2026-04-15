import { useState } from "react";
import apiClient from "../../../../services/api";
import * as XLSX from "xlsx";
import {
  Users,
  UserCheck,
  Clock,
  Calendar,
  Search,
  Database,
  Briefcase,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  TrendingUp
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
      const res = await apiClient.get(`/repot?month=${month}&year=${year}`);
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
    XLSX.utils.book_append_sheet(wb, ws, "Laporan HR");
    XLSX.writeFile(wb, `Laporan_HR_${month}_${year}.xlsx`);
  };

  return (
    /* Menghapus bg-slate-50 dan menggunakan bg-transparent agar menyatu */
    <div className="p-4 md:p-8 bg-transparent min-h-screen font-sans text-[#213448]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* BAGIAN HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border-2 border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#547792] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#547792]/20">
              <TrendingUp size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#213448]">
                Laporan <span className="text-[#547792]">Kecerdasan HR</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm">Analisis kehadiran dan performa SDM periode ini.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[#213448] font-bold self-start md:self-center">
            <Calendar size={18} className="text-[#547792]" />
            <span className="uppercase tracking-wider text-xs">
              {new Date(year, month - 1).toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* BAR FILTER */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-slate-100 flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-auto flex-1 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Bulan</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full border-2 border-slate-100 p-3.5 rounded-2xl bg-white font-bold text-[#213448] focus:border-[#547792] outline-none transition-all appearance-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tahun</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full border-2 border-slate-100 p-3.5 rounded-2xl bg-white font-bold text-[#213448] focus:border-[#547792] outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="flex-1 md:flex-none bg-[#213448] hover:bg-[#547792] text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-[#213448]/10"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              Cari Data
            </button>

            <button
              onClick={exportExcel}
              disabled={tableData.length === 0}
              className="flex-1 md:flex-none bg-white border-2 border-slate-100 text-slate-600 px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <FileSpreadsheet size={20} className="text-[#547792]" />
              Excel
            </button>
          </div>
        </div>

        {/* KARTU RINGKASAN */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Total Karyawan" value={summary.totalEmployees} icon={<Users size={22} />} color="text-[#547792]" bg="bg-[#94B4C1]/10" />
            <StatCard label="Hadir" value={summary.totalAttendance} icon={<UserCheck size={22} />} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard label="Terlambat" value={summary.totalLate} icon={<Clock size={22} />} color="text-amber-600" bg="bg-amber-50" />
            <StatCard label="Cuti" value={summary.totalLeave} icon={<AlertCircle size={22} />} color="text-rose-600" bg="bg-rose-50" />
            <StatCard label="Lembur" value={summary.totalOvertime} icon={<Briefcase size={22} />} color="text-indigo-600" bg="bg-indigo-50" />
          </div>
        )}

        {/* TABEL DATA */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">No</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Informasi Karyawan</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Departemen</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hadir</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Telat</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Cuti</th>
                  <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Lembur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tableData.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 text-slate-400 font-bold text-sm">{(i + 1).toString().padStart(2, '0')}</td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-[#213448] group-hover:text-[#547792] transition-colors">{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{r.position}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-[#213448] rounded-lg text-xs font-bold uppercase tracking-tighter">
                        {r.department}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center font-black text-[#213448]">{r.attendance}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`font-black ${r.late > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{r.late}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`font-black ${r.leave > 0 ? 'text-rose-600' : 'text-slate-300'}`}>{r.leave}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`font-black ${r.overtime > 0 ? 'text-[#547792]' : 'text-slate-300'}`}>{r.overtime}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tableData.length === 0 && !loading && (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                <Database className="text-slate-300" size={40} />
              </div>
              <h3 className="text-xl font-black text-[#213448]">Data Tidak Ditemukan</h3>
              <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 text-sm italic">
                Belum ada data laporan untuk periode yang dipilih. Silakan klik tombol cari data.
              </p>
            </div>
          )}

          {loading && (
             <div className="py-24 text-center flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-100 border-t-[#547792] rounded-full animate-spin"></div>
                  <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#547792]" size={24} />
                </div>
                <p className="text-[#213448] font-black uppercase tracking-widest text-[10px] mt-6">Sedang Memproses Data...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border-2 border-slate-100 flex items-center gap-4 transition-all hover:translate-y-[-4px] hover:shadow-md">
      <div className={`w-12 h-12 flex-shrink-0 ${bg} ${color} rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] truncate">{label}</p>
        <h3 className="text-xl font-black text-[#213448] leading-none mt-1">{value.toLocaleString()}</h3>
      </div>
    </div>
  );
}