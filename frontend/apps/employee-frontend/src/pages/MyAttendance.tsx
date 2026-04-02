import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/api";
import { 
  Calendar, Clock, AlertCircle, Timer,
  ArrowUpRight, ArrowDownRight,
  ArrowLeft 
} from "lucide-react";

const MyAttendance = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get("/attendance");
      const sortedData = (res.data.data || []).sort((a: any, b: any) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setData(sortedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Logic Ringkasan
  const totalHadir = data.length;
  const terlambat = data.filter(a => a.attendance_status === "LATE").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700 px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-500 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Log Kehadiran</h1>
            <p className="text-slate-500 font-medium text-sm">Lacak waktu kerja dan produktivitas Anda</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <input 
              type="month" 
              className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
              defaultValue={new Date().toISOString().slice(0, 7)}
          />
        </div>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Hadir', value: totalHadir, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tepat Waktu', value: totalHadir - terlambat, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Terlambat', value: terlambat, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Jam Kerja', value: '---', icon: Timer, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulan Ini</span>
            </div>
            <p className="text-3xl font-black text-slate-800">{stat.value}</p>
            <p className="text-sm font-bold text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hari & Tanggal</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Check In</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Check Out</th>
                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Durasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <p className="font-black text-slate-700">
                        {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(row.date))}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.date))}
                    </p>
                  </td>
                  <td className="p-6">
                    {/* ✅ BADGE TERLAMBAT DENGAN MENIT */}
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                      row.attendance_status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 
                      row.attendance_status === 'LATE' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {row.attendance_status}
                      {row.late_minutes && row.late_minutes > 0 && (
                        <span className="text-[8px] bg-white/80 px-1 py-0.5 rounded-full shadow-sm">
                          {row.late_minutes}m
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-700 font-black">
                      <ArrowUpRight size={18} className="text-emerald-500" />
                      {row.check_in ? new Date(row.check_in).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium truncate max-w-[150px]">
                      {row.checkin_address || '-'}
                    </p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-700 font-black">
                      <ArrowDownRight size={18} className="text-rose-500" />
                      {row.check_out ? new Date(row.check_out).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium truncate max-w-[150px]">
                      {row.checkout_address || '-'}
                    </p>
                  </td>
                  <td className="p-6 font-black text-slate-600">
                    {row.work_duration_minutes ? 
                      `${Math.floor(row.work_duration_minutes / 60)}j ${row.work_duration_minutes % 60}m` : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;