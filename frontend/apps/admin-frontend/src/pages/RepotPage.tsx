import { useState } from "react";
import apiClient from "../../../../services/api";
import {
  LayoutDashboard,
  Search,
  Calendar,
  Database,
  FileText,
  Loader2,
  Users,
  Wallet,
  Clock,
  UserX,
  CheckCircle2
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatIDR = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);
};

interface AdminSummary {
  totalEmployees: number;
  totalSalary: number;
  totalAttendance: number;
  totalLate: number;
  totalLeave: number;
}

export default function AdminReport() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [data, setData] = useState<AdminSummary | null>(null);
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
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text("HUMANEST GLOBAL REPORT", 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Periode: ${dateLabel}`, 14, 28);

    autoTable(doc, {
      startY: 40,
      head: [["Kategori Laporan", "Keterangan", "Nilai"]],
      body: [
        ["Keuangan", "Total Pengeluaran Gaji", formatIDR(data.totalSalary)],
        ["SDM", "Total Karyawan Terdaftar", `${data.totalEmployees} Orang`],
        ["Absensi", "Total Kehadiran", `${data.totalAttendance} Hari`],
        ["Kedisiplinan", "Total Keterlambatan", `${data.totalLate} Kali`],
        ["Izin/Cuti", "Total Absen", `${data.totalLeave} Kali`],
      ],
      headStyles: { fillColor: [5, 150, 105] },
    });
    doc.save(`Admin_Report_${month}_${year}.pdf`);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Admin Global Report</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Operational Summary</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-slate-600">
            <Calendar size={16} className="text-emerald-600" />
            <span className="text-sm font-semibold">
              {new Date(year, month - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* FILTER BOX */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-3 flex-1">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-700 p-2 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-48 transition-all"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 text-slate-700 p-2 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none w-28 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-medium transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Generate
            </button>

            <button
              onClick={exportPDF}
              disabled={!data}
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-medium transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText size={18} />
              PDF
            </button>
          </div>
        </div>

        {/* TABLE SUMMARY */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {data ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kategori Laporan</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Nilai / Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AdminRow 
                  icon={<Wallet size={18} className="text-emerald-600" />} 
                  label="Total Pengeluaran Gaji" 
                  value={formatIDR(data.totalSalary)} 
                  isBold 
                />
                <AdminRow 
                  icon={<Users size={18} className="text-blue-500" />} 
                  label="Total Karyawan Terdaftar" 
                  value={`${data.totalEmployees} Orang`} 
                />
                <AdminRow 
                  icon={<CheckCircle2 size={18} className="text-emerald-500" />} 
                  label="Total Kehadiran Karyawan" 
                  value={`${data.totalAttendance} Hari`} 
                />
                <AdminRow 
                  icon={<Clock size={18} className="text-amber-500" />} 
                  label="Total Keterlambatan" 
                  value={`${data.totalLate} Kali`} 
                />
                <AdminRow 
                  icon={<UserX size={18} className="text-red-500" />} 
                  label="Total Absen (Tanpa Keterangan)" 
                  value={`${data.totalLeave} Kali`} 
                />
              </tbody>
            </table>
          ) : (
            <div className="p-16 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Database className="text-slate-300" size={28} />
              </div>
              <p className="text-slate-400 font-medium">Data belum dimuat. Silakan klik Generate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AdminRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isBold?: boolean;
}

function AdminRow({ label, value, icon, isBold }: AdminRowProps) {
  return (
    <tr className="group hover:bg-slate-50 transition-colors">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-slate-100 rounded-lg group-hover:border-slate-200 transition-all shadow-sm">
            {icon}
          </div>
          <span className={`text-slate-700 ${isBold ? "font-bold" : "font-medium"}`}>{label}</span>
        </div>
      </td>
      <td className={`p-4 text-right text-slate-800 ${isBold ? "font-bold text-lg" : "font-semibold"}`}>
        {value}
      </td>
    </tr>
  );
}