import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/api";
import { 
  Eye, Send, Calendar as CalendarIcon, 
  X, ChevronLeft, Loader2, ChevronDown, Clock
} from "lucide-react";
import { showSuccess, showError } from "../../../../services/helper/swal";

const LeaveRequest = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);

  // 1. Tentukan standar waktu hari ini
  const today = new Date().toISOString().split("T")[0];
  
  // 2. Tentukan standar H+1 (Besok)
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  const [form, setForm] = useState({
    leave_type: "ANNUAL",
    start_date: tomorrow, // Default ke besok
    end_date: tomorrow,   // Default ke besok
    reason: "",
  });

  // Logika: Jika sakit boleh hari ini, jika cuti minimal besok
  const minStartDate = form.leave_type === "SICK" ? today : tomorrow;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get("/leave");
      setData(res.data.data || []);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  // Fungsi handle perubahan tanggal mulai
  const handleStartDateChange = (val: string) => {
    // Jika tanggal mulai baru lebih besar dari tanggal selesai yang sudah ada,
    // maka tanggal selesai otomatis ikut maju ke tanggal mulai baru tersebut.
    if (form.end_date < val) {
      setForm({ ...form, start_date: val, end_date: val });
    } else {
      setForm({ ...form, start_date: val });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Karena tanpa lampiran, kita bisa pakai JSON biasa (lebih cepat)
      await apiClient.post("/leave", {
        leave_type: form.leave_type,
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason
      });

      showSuccess("Berhasil", "Pengajuan cuti telah dikirim.");
      setForm({ leave_type: "ANNUAL", start_date: tomorrow, end_date: tomorrow, reason: "" });
      fetchData();
    } catch (error) {
      showError("Gagal", "Terjadi kesalahan saat mengirim.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER & BACK */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Cuti & Izin</h2>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Formulir Ketidakhadiran</p>
          </div>
        </div>
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
          <CalendarIcon size={24} />
        </div>
      </div>

      {/* FORM UTAMA */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[45px] border border-slate-100 shadow-sm space-y-6">
        
        {/* JENIS CUTI */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Pengajuan</label>
          <div className="relative">
            <select
              value={form.leave_type}
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-emerald-500 appearance-none font-bold text-slate-700 transition-all outline-none"
              onChange={(e) => setForm({ ...form, leave_type: e.target.value, start_date: e.target.value === 'SICK' ? today : tomorrow })}
            >
              <option value="ANNUAL">Cuti Tahunan</option>
              <option value="SICK">Izin Sakit</option>
              <option value="SPECIAL">Cuti Khusus / Keperluan Mendesak</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
          </div>
        </div>

        {/* TANGGAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dari Tanggal</label>
            <input
              type="date"
              required
              min={minStartDate}
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-emerald-500 font-bold text-slate-700 outline-none transition-all"
              value={form.start_date}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sampai Tanggal</label>
            <input
              type="date"
              required
              min={form.start_date} // Mengunci agar tgl selesai tidak bisa di bawah tgl mulai
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-emerald-500 font-bold text-slate-700 outline-none transition-all"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
        </div>

        {/* ALASAN */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alasan</label>
          <textarea
            placeholder="Tulis alasan singkat..."
            rows={3}
            className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl focus:bg-white focus:border-emerald-500 font-medium text-slate-700 outline-none transition-all resize-none shadow-inner"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black text-sm tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-200"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> KIRIM SEKARANG</>}
        </button>
      </form>

      {/* MINI HISTORY (VERTICAL STYLE) */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-700 text-xs uppercase tracking-[0.3em] ml-2">Riwayat Pengajuan</h3>
        <div className="space-y-3">
          {data.length > 0 ? data.map((row) => (
            <div key={row.id_leave} className="bg-white p-5 rounded-[30px] border border-slate-100 shadow-sm flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${row.leave_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-700 text-sm">{row.leave_type}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    {new Date(row.start_date).toLocaleDateString("id-ID")} - {new Date(row.end_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase ${
                  row.leave_status === 'APPROVED' ? 'bg-emerald-500 text-white' : 
                  row.leave_status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-white'
                }`}>
                  {row.leave_status}
                </span>
                <button onClick={() => setShowDetail(row)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center p-10 bg-slate-50 rounded-[35px] border border-dashed border-slate-200 text-slate-400 text-sm font-medium">
                Belum ada data pengajuan.
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL (SIMPLIFIED) */}
      {showDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white p-8 rounded-[45px] w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-2">Alasan Cuti</h3>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-6">{showDetail.leave_type}</p>
            <div className="bg-slate-50 p-6 rounded-[30px] text-slate-600 font-medium italic leading-relaxed border border-slate-100 mb-8">
              "{showDetail.reason}"
            </div>
            <button 
              onClick={() => setShowDetail(null)} 
              className="w-full bg-slate-900 text-white py-4 rounded-[20px] font-black text-xs tracking-widest transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              TUTUP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequest;