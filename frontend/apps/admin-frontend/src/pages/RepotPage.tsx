import { useState } from "react";
import apiClient from "../../../../services/api";
import { 
  LayoutDashboard, 
  Search, 
  Calendar, 
  Database, 
  ChevronRight,
  ShieldCheck,
  FileText 
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatIDR = (number: any) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);
};

export default function AdminReport() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/repot?month=${month}&year=${year}`);
      setData(res.data.summary);
    } catch (err) {
      console.error("Gagal menarik data admin", err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    const dateLabel = new Date(year, month - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

    doc.setFontSize(18);
    doc.text("ADMIN GLOBAL REPORT", 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Periode: ${dateLabel}`, 14, 28);

    autoTable(doc, {
      startY: 40,
      head: [["Kategori Laporan Utama", "Nilai / Kalkulasi"]],
      body: [
        ["Total Pengeluaran Gaji", formatIDR(data.totalSalary)],
        ["Total Karyawan Terdaftar", `${data.totalEmployee} Orang`],
        ["Total Kehadiran Seluruh Staff", `${data.hadir} Hari`],
        ["Total Insiden Keterlambatan", `${data.telat} Kali`],
        ["Total Absen (Tanpa Keterangan)", `${data.absen} Kali`],
      ],
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save(`Admin_Report_${month}_${year}.pdf`);
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-[1000px] mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tight">Admin Global Report</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium italic">Ringkasan eksekutif seluruh parameter sistem</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 font-black text-slate-700 text-sm uppercase tracking-widest tabular-nums">
            <Calendar className="text-slate-900" size={18} />
            {new Date(year, month - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </div>
        </div>

        {/* FILTER BOX */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest z-10">Bulan Periode</label>
              <select 
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none appearance-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("id-ID", { month: "long" })}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest z-10">Tahun</label>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchReport} 
              disabled={loading}
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "..." : <Search size={16} />} Generate
            </button>
            <button 
              onClick={exportPDF} 
              disabled={!data || loading}
              className="bg-rose-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-30"
            >
              <FileText size={16} /> PDF
            </button>
          </div>
        </div>

        {/* TABLE SUMMARY */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Master Global Summary</h3>
            <div className="flex items-center gap-2 text-[9px] font-black text-slate-900 bg-white px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest shadow-sm">
              <ShieldCheck size={10} strokeWidth={3} className="text-emerald-500" /> System Authorized
            </div>
          </div>

          <div className="overflow-x-auto">
            {data ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-white text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                    <th className="px-10 py-6 text-left w-2/3">Kategori Laporan Utama</th>
                    <th className="px-10 py-6 text-right">Nilai / Kalkulasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AdminTableRow label="Total Pengeluaran Gaji" value={formatIDR(data.totalSalary)} color="text-emerald-600" />
                  <AdminTableRow label="Total Karyawan Terdaftar" value={`${data.totalEmployee} Orang`} color="text-indigo-600" />
                  <AdminTableRow label="Total Kehadiran Seluruh Staff" value={`${data.hadir} Hari`} color="text-blue-600" />
                  <AdminTableRow label="Total Insiden Keterlambatan" value={`${data.telat} Kali`} color="text-amber-500" />
                  <AdminTableRow label="Total Absen (Tanpa Keterangan)" value={`${data.absen} Kali`} color="text-rose-500" />
                </tbody>
              </table>
            ) : (
              <div className="py-32 text-center flex flex-col items-center justify-center opacity-40">
                <Database size={48} className="text-slate-200 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Silakan tarik data dari server</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// FUNGSI HELPER BARIS (Taruh di dalam file yang sama tapi di luar fungsi utama)
function AdminTableRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <tr className="bg-white hover:bg-slate-50/80 transition-all group">
      <td className="px-10 py-6 flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-slate-900 transition-all" />
        <span className="text-sm font-black text-slate-600 uppercase tracking-tight group-hover:text-slate-900">
          {label}
        </span>
      </td>
      <td className="px-10 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className={`text-base font-black tabular-nums tracking-tighter ${color}`}>
            {value}
          </span>
          <ChevronRight size={14} className="text-slate-200 group-hover:text-slate-400 transition-all group-hover:translate-x-1" />
        </div>
      </td>
    </tr>
  );
}