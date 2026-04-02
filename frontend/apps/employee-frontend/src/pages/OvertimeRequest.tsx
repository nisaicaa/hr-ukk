import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/api";
import { Eye, Clock3, ArrowLeft, Send, History, Calendar } from "lucide-react";
import { showSuccess, showToast } from "../../../../services/helper/swal";
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:7000');

const OvertimeRequest = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<any>(null);
  
  // Fungsi untuk ambil jam sekarang format HH:mm
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: "17:30", // ✅ Default Jam Mulai
    end_time: getCurrentTime(), // ✅ OTOMATIS KE JAM SEKARANG
    overtime_reason: ""
  });

  const fetchData = async () => {
    try {
      const res = await apiClient.get("/overtime");
      setData(res.data.data || []);
    } catch (e) {
      showToast("Gagal mengambil data", "error");
    }
  };

  useEffect(() => {
    fetchData();
    const userId = localStorage.getItem('userId');
    if (userId) {
      socket.on(`overtimeStatus_${userId}`, () => {
        fetchData();
        showToast("Status lembur diperbarui", "info");
      });
    }
    return () => { socket.off(`overtimeStatus_${userId}`); };
  }, []);

  const calculateMinutes = () => {
    if (!form.date || !form.start_time || !form.end_time) return 0;
    const start = new Date(`${form.date}T${form.start_time}`);
    const end = new Date(`${form.date}T${form.end_time}`);
    const diff = Math.round((end.getTime() - start.getTime()) / 60000);
    return diff > 0 ? diff : 0;
  };

  const totalMinutes = calculateMinutes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalMinutes <= 0) {
      showToast("Jam selesai harus setelah jam mulai (17:30)", "error");
      return;
    }
    try {
      await apiClient.post("/overtime", {
        date: form.date,
        start_time: `${form.date}T${form.start_time}`,
        end_time: `${form.date}T${form.end_time}`,
        overtime_reason: form.overtime_reason
      });
      showSuccess("Berhasil", "Pengajuan lembur terkirim");
      setForm({ ...form, end_time: getCurrentTime(), overtime_reason: "" });
      fetchData();
    } catch (e) {
      showToast("Gagal submit", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Form Lembur</h2>
          <p className="text-slate-400 text-xs font-medium">Laporkan jam kerja tambahan Anda.</p>
        </div>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tanggal</label>
            <div className="relative">
                <Calendar className="absolute left-4 top-4 text-slate-400" size={18} />
                <input 
                    type="date" 
                    required 
                    value={form.date} 
                    onChange={(e) => setForm({ ...form, date: e.target.value })} 
                    className="w-full border border-slate-100 bg-slate-50/50 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700" 
                />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 text-blue-500">Jam Mulai (Standar)</label>
              <input 
                type="time" 
                required 
                value={form.start_time} 
                onChange={(e) => setForm({ ...form, start_time: e.target.value })} 
                className="w-full border border-blue-50 bg-blue-50/20 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 text-emerald-500">Jam Selesai (Sekarang)</label>
              <input 
                type="time" 
                required 
                value={form.end_time} 
                onChange={(e) => setForm({ ...form, end_time: e.target.value })} 
                className="w-full border border-emerald-50 bg-emerald-50/20 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-700" 
              />
            </div>
          </div>

          {/* TOTAL DURASI */}
          <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${totalMinutes > 0 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-50 border-slate-50 text-slate-300'}`}>
            <div className="flex items-center gap-2">
                <Clock3 size={18} className={totalMinutes > 0 ? 'text-blue-400' : 'text-slate-300'} />
                <span className="font-bold text-xs uppercase tracking-wider">Durasi Lembur</span>
            </div>
            <span className="font-black text-xl">{Math.floor(totalMinutes / 60)}j {totalMinutes % 60}m</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Alasan Pekerjaan</label>
            <textarea 
              placeholder="Contoh: Menyelesaikan laporan bulanan..." 
              value={form.overtime_reason} 
              onChange={(e) => setForm({ ...form, overtime_reason: e.target.value })} 
              className="w-full border border-slate-100 bg-slate-50/50 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700" 
              rows={2} 
              required 
            />
          </div>
        </div>

        <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs shadow-lg shadow-slate-100">
          <Send size={16} /> Ajukan Sekarang
        </button>
      </form>

      {/* RECENT HISTORY */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
            <History size={16} className="text-slate-400" />
            <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest">Riwayat 3 Terakhir</h3>
        </div>
        
        <div className="space-y-3">
          {data.slice(0, 3).map((row) => (
            <div key={row.id_overtime} className="bg-white p-5 rounded-[25px] border border-slate-100 shadow-sm flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 font-bold text-xs italic">
                    {new Date(row.date).getDate()}
                </div>
                <div>
                    <div className="font-black text-slate-700 text-sm">
                    {new Date(row.date).toLocaleDateString("id-ID", { month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] font-bold text-blue-500">
                    {Math.floor(row.total_minutes / 60)} Jam {row.total_minutes % 60} Menit
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                  row.overtime_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                  row.overtime_status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {row.overtime_status}
                </span>
                <button onClick={() => setShowDetail(row)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-[35px] w-full max-w-xs space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-black text-slate-800">Detail Alasan</h3>
            <div className="bg-slate-50 p-5 rounded-2xl text-slate-600 text-sm font-medium italic border border-slate-100">
              "{showDetail.overtime_reason}"
            </div>
            <button onClick={() => setShowDetail(null)} className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OvertimeRequest;