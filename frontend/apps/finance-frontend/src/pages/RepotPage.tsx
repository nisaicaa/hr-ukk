import { useState } from "react";
import apiClient from "../../../../services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FileText, 
  Download, 
  Search, 
  Users, 
  Wallet, 
  Clock, 
  TrendingDown, 
  Calendar,
  Database,
  FileDown // Icon baru untuk PDF
} from "lucide-react";

// Helper Format Rupiah
const formatIDR = (number: any) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);
};

export default function FinanceReport() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [tableData, setTableData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/repot?month=${month}&year=${year}`);
      setTableData(res.data.table || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (tableData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Payroll");
    XLSX.writeFile(wb, `Payroll_${month}_${year}.xlsx`);
  };

  // --- FUNGSI EXPORT PDF BARU ---
  const exportPDF = () => {
    if (tableData.length === 0) return;

    const doc = new jsPDF("l", "mm", "a4"); // 'l' untuk landscape agar muat banyak kolom
    const dateLabel = new Date(year, month - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

    // Header PDF
    doc.setFontSize(18);
    doc.text("LAPORAN PAYROLL KARYAWAN", 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Periode: ${dateLabel} | Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 22);

    // Garis Pemisah
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 25, 283, 25);

    // Mapping data untuk tabel PDF
    const rows = tableData.map((item, index) => [
      index + 1,
      item.name.toUpperCase(),
      item.department.toUpperCase(),
      formatIDR(item.basicSalary),
      item.attendance,
      formatIDR(item.overtime),
      formatIDR(item.deduction),
      formatIDR(item.totalSalary),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["NO", "NAMA KARYAWAN", "DIVISI", "GAJI POKOK", "HADIR", "LEMBUR", "POTONGAN", "TOTAL BERSIH"]],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "center" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right", fontStyle: "bold" },
      },
    });

    // Simpan File
    doc.save(`Laporan_Payroll_${month}_${year}.pdf`);
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 leading-none uppercase tracking-tight">Laporan Payroll</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium italic">Manajemen & Rekapitulasi Gaji Karyawan</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-xl border border-slate-100">
            <Calendar className="text-emerald-600" size={18} />
            <span className="text-sm font-black text-slate-700 uppercase tracking-widest tabular-nums">
              {new Date(year, month - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* FILTER BOX */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="absolute -top-2 left-4 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulan</label>
              <select 
                value={month} 
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none cursor-pointer"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchReport} 
              disabled={loading}
              className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? "..." : <Search size={16} />} Generate
            </button>
            
            {/* BUTTON PDF */}
            <button 
              onClick={exportPDF} 
              disabled={tableData.length === 0}
              className="bg-rose-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-rose-100"
            >
              <FileDown size={16} /> PDF
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

        {/* SUMMARY & TABLE (Tetap sama seperti kode Anda sebelumnya) */}
        {/* ... bagian summary dan table map ... */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StatCard label="Total Personil" value={summary.totalEmployee} unit="ORANG" icon={<Users />} color="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Pengeluaran Gaji" value={formatIDR(summary.totalPayroll)} unit="NET" icon={<Wallet />} color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard label="Total Lembur" value={formatIDR(summary.totalOvertime)} unit="EXTRA" icon={<Clock />} color="text-amber-600" bg="bg-amber-50" />
            <StatCard label="Total Potongan" value={formatIDR(summary.totalDeduction)} unit="MINUS" icon={<TrendingDown />} color="text-rose-600" bg="bg-rose-50" />
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Rincian Transaksi Payroll</h3>
            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
              <Database size={10} strokeWidth={3} /> Server Connected
            </div>
          </div>

          <div className="overflow-x-auto font-sans">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-white">
                  <th className="px-8 py-6 text-center w-16 italic">No</th>
                  <th className="px-8 py-6 text-left">Informasi Karyawan</th>
                  <th className="px-8 py-6 text-right">Gaji Pokok</th>
                  <th className="px-8 py-6 text-center">Kehadiran</th>
                  <th className="px-8 py-6 text-right">Lembur</th>
                  <th className="px-8 py-6 text-right text-rose-500">Potongan</th>
                  <th className="px-8 py-6 text-right font-black text-slate-900 bg-slate-50/50">Total Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {tableData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-8 py-6 text-center font-bold text-slate-300 group-hover:text-emerald-500 transition-colors">{i + 1}</td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-800 uppercase tracking-tight text-sm leading-tight">{row.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{row.department}</p>
                    </td>
                    <td className="px-8 py-6 text-right font-bold tabular-nums text-slate-600">{formatIDR(row.basicSalary)}</td>
                    <td className="px-8 py-6 text-center">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black italic border border-indigo-100">
                        {row.attendance} HARI
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right tabular-nums text-emerald-600 font-bold">{formatIDR(row.overtime)}</td>
                    <td className="px-8 py-6 text-right tabular-nums text-rose-500 font-bold">({formatIDR(row.deduction)})</td>
                    <td className="px-8 py-6 text-right tabular-nums font-black text-slate-900 bg-slate-50/30 group-hover:bg-emerald-50 transition-colors">
                      {formatIDR(row.totalSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, bg, unit }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 group hover:-translate-y-1 transition-all duration-300">
      <div className={`${bg} ${color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none tabular-nums">{value}</h4>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{unit}</span>
        </div>
      </div>
    </div>
  );
}