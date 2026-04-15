import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/api";
import { 
  Calendar, Clock, AlertCircle, Timer,
  ChevronLeft, ChevronRight, Search
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000";

const MyAttendance = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get("/attendance");
      const sortedData = (res.data.data || []).sort(
        (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setData(sortedData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const itemMonth = new Date(item.date).toISOString().slice(0, 7);
      return itemMonth === selectedMonth;
    });
  }, [data, selectedMonth]);

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const currentYear = selectedMonth.split('-')[0];
  const currentMonthIdx = parseInt(selectedMonth.split('-')[1]) - 1;

  const handleYearChange = (offset: number) => {
    const newYear = parseInt(currentYear) + offset;
    setSelectedMonth(`${newYear}-${selectedMonth.split('-')[1]}`);
  };

  const handleMonthSelect = (idx: number) => {
    const monthStr = (idx + 1).toString().padStart(2, '0');
    setSelectedMonth(`${currentYear}-${monthStr}`);
    setShowMonthPicker(false);
  };

  // Stats
  const totalHadir = filteredData.length;
  const terlambat = filteredData.filter((a) => a.attendance_status === "LATE").length;
  const tepatWaktu = filteredData.filter((a) => a.attendance_status === "PRESENT").length;
  const totalMinutes = filteredData.reduce((sum, item) => sum + (item.work_duration_minutes || 0), 0);
  const totalJamKerja = `${Math.floor(totalMinutes / 60)}j ${totalMinutes % 60}m`;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-[#213448] rounded-full animate-spin mb-2" />
        Memuat Data...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
      
      {/* HEADER - BUTTON DISAMAKAN DENGAN LEAVE REQUEST */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)} 
            className="p-4 bg-white rounded-[22px] border border-slate-100 shadow-sm text-[#213448] hover:bg-[#213448] hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#213448] tracking-tighter">
              Log Kehadiran
            </h1>
            <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">
              Humanest System • 2026
            </p>
          </div>
        </div>

        {/* CUSTOM MONTH PICKER */}
        <div className="relative" ref={pickerRef}>
          <button 
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="flex items-center gap-3 bg-[#213448] text-white px-6 py-4 rounded-[25px] font-black shadow-lg shadow-[#213448]/20 hover:bg-[#2c445e] transition-all active:scale-95 w-full md:w-auto"
          >
            <Calendar size={18} />
            <span className="uppercase tracking-widest text-sm">
              {months[currentMonthIdx]} {currentYear}
            </span>
          </button>

          {showMonthPicker && (
            <div className="absolute top-full right-0 mt-3 w-72 bg-white rounded-[35px] shadow-2xl border border-slate-50 p-6 z-50 animate-in zoom-in-95 duration-200 origin-top-right">
              <div className="flex items-center justify-between mb-6 px-2">
                <button onClick={() => handleYearChange(-1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronLeft size={20}/></button>
                <span className="font-black text-[#213448] text-lg">{currentYear}</span>
                <button onClick={() => handleYearChange(1)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><ChevronRight size={20}/></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {months.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => handleMonthSelect(i)}
                    className={`py-3 rounded-2xl text-xs font-black uppercase transition-all ${
                      i === currentMonthIdx ? 'bg-[#213448] text-white shadow-md' : 'hover:bg-slate-50 text-slate-400 hover:text-[#213448]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Hadir', value: totalHadir, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Tepat Waktu', value: tepatWaktu, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Terlambat', value: terlambat, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Total Jam', value: totalJamKerja, icon: Timer, color: 'text-[#213448]', bg: 'bg-slate-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[35px] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-[100px] -mr-8 -mt-8 opacity-40 group-hover:scale-110 transition-transform`} />
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 relative z-10`}>
              <stat.icon size={24} />
            </div>
            <p className="text-3xl font-black text-[#213448] tracking-tighter relative z-10">{stat.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 relative z-10">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[45px] border border-slate-50 shadow-sm overflow-hidden border-b-8 border-b-slate-50/50">
        <div className="p-8 flex items-center justify-between bg-white">
          <div>
            <h2 className="font-black text-[#213448] uppercase text-sm tracking-[0.2em]">Riwayat Absensi</h2>
            <p className="text-slate-400 text-[10px] font-bold mt-0.5">MENAMPILKAN {filteredData.length} AKTIVITAS</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Check In/Out</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Foto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-black text-[#213448]">{new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(row.date))}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(row.date))}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-block px-4 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-wider ${row.attendance_status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {row.attendance_status === 'PRESENT' ? 'Tepat Waktu' : 'Terlambat'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Masuk</span>
                        <span className="font-black text-[#213448] text-sm">{row.check_in ? new Date(row.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-200 mt-2" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Pulang</span>
                        <span className="font-black text-[#213448] text-sm">{row.check_out ? new Date(row.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      {row.checkin_photo ? (
                        <img src={`${API_URL}/uploads/${row.checkin_photo}`} className="w-11 h-11 rounded-[16px] object-cover ring-4 ring-slate-50 hover:scale-125 transition-all cursor-pointer" alt="Verif" />
                      ) : (
                        <Search size={16} className="text-slate-200" />
                      )}
                    </div>
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