import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { showToast } from "../../../../services/helper/swal";
import { History, Search, Filter, CalendarDays } from "lucide-react";

const LogActivityPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (month && year) { params.month = month; params.year = year; }
      if (startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }
      if (year && !month) { params.year = year; }

      const res = await apiClient.get("/logs", { params });
      setLogs(res.data.data);
    } catch (error: any) {
      console.error(error);
      showToast("Gagal mengambil data log", "error");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "UPDATE": return "bg-amber-100 text-amber-700 border-amber-200";
      case "DELETE": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
      
      {/* HEADER SECTION - Selaras dengan User Management */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="bg-[#213448]/10 p-3 rounded-xl text-[#213448]">
            <History size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#213448]">Log Aktivitas Sistem</h1>
            <p className="text-slate-500 text-sm">Pantau seluruh riwayat perubahan dan aksi pengguna dalam sistem</p>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-6 text-[#547792]">
          <Filter size={18} />
          <span className="font-bold uppercase text-xs tracking-wider">Filter Data</span>
        </div>
        
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Dari Tanggal</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#547792]/5 focus:border-[#547792] outline-none transition-all text-sm text-slate-700"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#547792]/5 focus:border-[#547792] outline-none transition-all text-sm text-slate-700"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Bulan</label>
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)} 
              className="pl-4 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#547792]/5 focus:border-[#547792] outline-none transition-all text-sm text-slate-700"
            >
              <option value="">Semua Bulan</option>
              {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Tahun</label>
            <input 
              type="number" 
              placeholder="2026" 
              value={year} 
              onChange={(e) => setYear(e.target.value)} 
              className="pl-4 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#547792]/5 focus:border-[#547792] outline-none transition-all text-sm text-slate-700 w-28"
            />
          </div>

          <button 
            onClick={fetchLogs} 
            className="bg-[#547792] hover:bg-[#456279] text-white px-6 py-2.5 rounded-xl flex gap-2 items-center transition-all shadow-md shadow-slate-200 font-bold text-sm"
          >
            <Search size={18} />
            Terapkan Filter
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tabel</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 font-medium">Memuat data...</td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id_log} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-[#213448]">
                        {new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#213448] font-bold text-xs border border-slate-200">
                          {log.user?.username?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <span className="font-semibold text-slate-700">{log.user?.username || 'Sistem'}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-5">
                      <code className="bg-slate-100 text-[#547792] px-2 py-1 rounded-md text-xs font-bold border border-slate-200">
                        {log.table_name}
                      </code>
                    </td>
                    <td className="p-5 text-slate-600 text-sm leading-relaxed">
                      {log.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <CalendarDays size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-medium">Tidak ada data aktivitas ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogActivityPage;