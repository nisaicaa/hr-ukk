import { useState } from "react";
import apiClient from "../../../../services/api";
import * as XLSX from "xlsx";
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  FileSpreadsheet, 
  Search, 
  Download,
  Database,
  Briefcase,
  AlertCircle
} from "lucide-react";

export default function HRReport() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [tableData, setTableData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
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
    XLSX.utils.book_append_sheet(wb, ws, "HR Report");
    XLSX.writeFile(wb, `HR_Report_${month}_${year}.xlsx`);
  };

  return (
    <div className="p-8 bg-[#F1F5F9] min-h-screen font-sans">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tight">HR Intelligence Report</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium italic">Monitoring kehadiran & produktivitas personil</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
            <Calendar className="text-indigo-600" size={18} />
            <span className="text-sm font-black text-slate-700 uppercase tracking-widest tabular-nums">
              {new Date(year, month - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* FILTER BOX */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Periode Bulan</label>
              <select 
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("id-ID", { month: "long" })}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tahun</label>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchReport} 
              disabled={loading}
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Search size={16} />} 
              Generate
            </button>
            <button 
              onClick={exportExcel} 
              disabled={tableData.length === 0}
              className="bg-emerald-500 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-100"
            >
              <Download size={16} /> Excel
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS HR */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard label="Total Staff" value={summary.totalEmployees} unit="PERSON" icon={<Users />} color="text-indigo-600" bg="bg-indigo-50" />
            <StatCard label="Total Hadir" value={summary.totalAttendance} unit="HARI" icon={<UserCheck />} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard label="Total Telat" value={summary.totalLate} unit="KALI" icon={<Clock />} color="text-amber-600" bg="bg-amber-50" />
            <StatCard label="Total Cuti" value={summary.totalLeave} unit="HARI" icon={<AlertCircle />} color="text-rose-600" bg="bg-rose-50" />
            <StatCard label="Lembur" value={summary.totalOvertime} unit="JAM" icon={<Briefcase />} color="text-blue-600" bg="bg-blue-50" />
          </div>
        )}

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Data Kehadiran Personil</h3>
            <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
              <Database size={10} strokeWidth={3} /> HR Core System
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-white text-left">
                  <th className="px-8 py-6 text-center w-16">No</th>
                  <th className="px-8 py-6">Karyawan & Posisi</th>
                  <th className="px-8 py-6">Departemen</th>
                  <th className="px-8 py-6 text-center">Hadir</th>
                  <th className="px-8 py-6 text-center">Telat</th>
                  <th className="px-8 py-6 text-center">Cuti</th>
                  <th className="px-8 py-6 text-center bg-slate-50/50 font-black text-slate-900 italic">Lembur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {tableData.length > 0 ? tableData.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-6 text-center font-bold text-slate-300 group-hover:text-indigo-600 transition-colors">{i + 1}</td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 uppercase tracking-tight text-sm leading-tight">{r.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{r.position}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[10px] font-black uppercase">
                        {r.department}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-emerald-600 font-black">{r.attendance}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`${r.late > 0 ? "text-amber-500 font-black" : "text-slate-300 font-medium"}`}>
                        {r.late}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`${r.leave > 0 ? "text-rose-500 font-black" : "text-slate-300 font-medium"}`}>
                        {r.leave}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center font-black text-indigo-600 bg-slate-50/30 group-hover:bg-indigo-50/50 transition-colors">
                      {r.overtime} <span className="text-[9px] font-bold text-slate-400">JAM</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-24 text-center opacity-30">
                      <div className="flex flex-col items-center">
                        <Search size={48} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Klik Generate Untuk Data</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-Komponen Card Statistik
function StatCard({ label, value, icon, color, bg, unit }: any) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 group hover:-translate-y-1 transition-all duration-300">
      <div className={`${bg} ${color} w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none tabular-nums">{value}</h4>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{unit}</span>
        </div>
      </div>
    </div>
  );
}