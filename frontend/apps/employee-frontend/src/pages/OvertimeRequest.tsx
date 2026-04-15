import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/api";
import { Eye, Clock3, ChevronLeft, Send, History, Calendar } from "lucide-react";
import { showSuccess, showToast } from "../../../../services/helper/swal";
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:7000');

const OvertimeRequest = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const getCurrentTime = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: "17:30",
    end_time: getCurrentTime(),
    overtime_reason: ""
  });

  const fetchData = async () => {
    try {
      const res = await apiClient.get("/overtime");
      setData(res.data.data || []);
    } catch { showToast("Gagal mengambil data riwayat", "error"); }
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

  const totalMinutes = (() => {
    if (!form.date || !form.start_time || !form.end_time) return 0;
    const diff = (new Date(`${form.date}T${form.end_time}`).getTime() - new Date(`${form.date}T${form.start_time}`).getTime()) / 60000;
    return diff > 0 ? Math.round(diff) : 0;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalMinutes <= 0) return showToast("Jam selesai harus setelah jam mulai", "error");
    
    setLoading(true);
    try {
      await apiClient.post("/overtime", {
        ...form,
        start_time: `${form.date}T${form.start_time}`,
        end_time: `${form.date}T${form.end_time}`,
      });
      showSuccess("Berhasil", "Laporan lembur telah dikirim.");
      setForm(prev => ({ ...prev, end_time: getCurrentTime(), overtime_reason: "" }));
      fetchData();
    } catch { 
      showToast("Gagal mengirim laporan", "error"); 
    } finally {
      setLoading(false);
    }
  };

  const InputGroup = ({ label, children }: any) => (
    <div className="space-y-2 flex-1">
      <label className="text-[10px] font-black uppercase ml-1 text-slate-400 tracking-widest">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      
      {/* HEADER */}
      <header className="flex items-center gap-5 pt-8">
        <button onClick={() => navigate(-1)} className="p-4 bg-white rounded-[22px] border border-slate-100 shadow-sm text-[#213448] hover:bg-[#213448] hover:text-white transition-all active:scale-90">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-[#213448] tracking-tighter">Form Lembur</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Laporan Kerja Tambahan</p>
        </div>
      </header>

      {/* FORM UTAMA */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] space-y-6">
        <InputGroup label="Tanggal Kerja">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border-2 border-transparent bg-slate-50 p-4 pl-12 rounded-2xl font-bold text-[#213448] focus:bg-white focus:border-[#213448] transition-all outline-none" />
          </div>
        </InputGroup>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup label="Jam Mulai">
            <input type="time" required value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full border-2 border-transparent bg-slate-50 p-4 rounded-2xl font-bold text-[#213448] focus:bg-white focus:border-[#213448] outline-none transition-all" />
          </InputGroup>
          <InputGroup label="Jam Selesai">
            <input type="time" required value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full border-2 border-transparent bg-slate-50 p-4 rounded-2xl font-bold text-[#213448] focus:bg-white focus:border-[#213448] outline-none transition-all" />
          </InputGroup>
        </div>

        {/* DURATION BADGE */}
        <div className={`p-5 rounded-[25px] flex items-center justify-between border-2 transition-all duration-500 ${totalMinutes > 0 ? 'bg-[#213448] border-[#213448] text-white shadow-xl shadow-[#213448]/20' : 'bg-slate-50 border-transparent text-slate-300'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${totalMinutes > 0 ? 'bg-white/10' : 'bg-slate-100'}`}>
                <Clock3 size={20} className={totalMinutes > 0 ? 'text-white' : 'text-slate-300'} />
            </div>
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">Estimasi Durasi</span>
          </div>
          <span className="font-black text-2xl tracking-tighter">{Math.floor(totalMinutes / 60)}j {totalMinutes % 60}m</span>
        </div>

        <InputGroup label="Alasan / Pekerjaan">
          <textarea placeholder="Tuliskan detail pekerjaan lembur Anda..." value={form.overtime_reason} onChange={e => setForm({...form, overtime_reason: e.target.value})} className="w-full border-2 border-transparent bg-slate-50 p-5 rounded-3xl font-medium text-[#213448] focus:bg-white focus:border-[#213448] outline-none transition-all resize-none shadow-inner" rows={3} required />
        </InputGroup>

        <button disabled={loading} type="submit" className="w-full bg-[#213448] text-white py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#2c445e] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-[#213448]/10 disabled:bg-slate-200">
          {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Kirim Laporan Lembur</>}
        </button>
      </form>

      {/* HISTORY */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2 text-[#213448] uppercase tracking-[0.3em] text-[10px] font-black">
          <History size={16} /> Riwayat Terakhir
        </div>
        <div className="space-y-3">
          {data.slice(0, 5).map((row) => (
            <div key={row.id_overtime} className="bg-white p-5 rounded-[30px] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#213448] font-black text-sm border border-slate-100">
                    {new Date(row.date).getDate()}
                </div>
                <div>
                  <div className="font-black text-[#213448] text-sm uppercase tracking-tighter">{new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(row.date))}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{Math.floor(row.total_minutes / 60)} jam {row.total_minutes % 60} menit</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    row.overtime_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                    row.overtime_status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                    {row.overtime_status === 'PENDING' ? 'PROSES' : row.overtime_status === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'}
                </span>
                <button onClick={() => setShowDetail(row)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#213448] hover:text-white transition-all">
                    <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
          {data.length === 0 && (
              <div className="text-center py-12 bg-slate-50/50 rounded-[30px] border-2 border-dashed border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  Belum ada riwayat lembur
              </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showDetail && (
        <div className="fixed inset-0 bg-[#213448]/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-sm space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div>
                <h3 className="text-xl font-black text-[#213448]">Detail Pekerjaan</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Laporan Lembur</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-[25px] text-[#213448] text-sm font-medium leading-relaxed border border-slate-100 min-h-[100px]">
                "{showDetail.overtime_reason}"
            </div>
            <button onClick={() => setShowDetail(null)} className="w-full bg-[#213448] text-white py-4 rounded-[20px] font-black uppercase text-xs tracking-[0.2em] shadow-lg active:scale-95 transition-all">
                TUTUP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OvertimeRequest;