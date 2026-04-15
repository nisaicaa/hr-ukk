import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/api";
import { 
  Eye, Send, Calendar as CalendarIcon, 
  ChevronLeft, Loader2, ChevronDown, Clock
} from "lucide-react";
import { showSuccess, showError } from "../../../../services/helper/swal";

const LeaveRequest = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);

  const today = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];

  // Mapping Bahasa Indonesia untuk Jenis Cuti
  const leaveTypeMap: { [key: string]: string } = {
    ANNUAL: "Cuti Tahunan",
    SICK: "Izin Sakit",
    SPECIAL: "Cuti Khusus"
  };

  const [form, setForm] = useState({
    leave_type: "ANNUAL",
    start_date: tomorrow,
    end_date: tomorrow,
    reason: "",
  });

  const minStartDate = form.leave_type === "SICK" ? today : tomorrow;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get("/leave");
      setData(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  const handleStartDateChange = (val: string) => {
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
      showError("Gagal", "Terjadi kesalahan saat mengirim pengajuan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pt-8">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate(-1)}
            className="p-4 bg-white rounded-[22px] border border-slate-100 shadow-sm text-[#213448] hover:bg-[#213448] hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#213448] tracking-tighter">Cuti & Izin</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Formulir Ketidakhadiran</p>
          </div>
        </div>
        <div className="p-4 bg-slate-50 text-[#213448] rounded-[22px] border border-slate-100 hidden sm:block">
          <CalendarIcon size={24} />
        </div>
      </div>

      {/* FORM UTAMA */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Pengajuan</label>
          <div className="relative">
            <select
              value={form.leave_type}
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-[#213448] appearance-none font-bold text-[#213448] transition-all outline-none"
              onChange={(e) => setForm({ ...form, leave_type: e.target.value, start_date: e.target.value === 'SICK' ? today : tomorrow })}
            >
              <option value="ANNUAL">Cuti Tahunan</option>
              <option value="SICK">Izin Sakit</option>
              <option value="SPECIAL">Cuti Khusus / Mendesak</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dari Tanggal</label>
            <input
              type="date"
              required
              min={minStartDate}
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-[#213448] font-bold text-[#213448] outline-none transition-all"
              value={form.start_date}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sampai Tanggal</label>
            <input
              type="date"
              required
              min={form.start_date}
              className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-[#213448] font-bold text-[#213448] outline-none transition-all"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alasan Pengajuan</label>
          <textarea
            placeholder="Tuliskan alasan atau keperluan Anda..."
            rows={3}
            className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-3xl focus:bg-white focus:border-[#213448] font-medium text-[#213448] outline-none transition-all resize-none shadow-inner"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-[#213448] text-white py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#213448]/10 hover:bg-[#2c445e] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-200"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Kirim Pengajuan</>}
        </button>
      </form>

      {/* HISTORY */}
      <div className="space-y-4">
        <h3 className="font-black text-[#213448] text-xs uppercase tracking-[0.3em] ml-2">Riwayat Pengajuan</h3>
        <div className="space-y-3">
          {data.length > 0 ? data.map((row) => (
            <div key={row.id_leave} className="bg-white p-5 rounded-[30px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${row.leave_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                  <Clock size={20} />
                </div>
                <div>
                  <p className="font-black text-[#213448] text-sm uppercase tracking-tighter">
                    {leaveTypeMap[row.leave_type] || row.leave_type}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                    {new Date(row.start_date).toLocaleDateString("id-ID", {day: 'numeric', month: 'short'})} - {new Date(row.end_date).toLocaleDateString("id-ID", {day: 'numeric', month: 'short', year: 'numeric'})}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase ${
                  row.leave_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 
                  row.leave_status === 'REJECTED' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {row.leave_status === 'PENDING' ? 'PROSES' : row.leave_status === 'APPROVED' ? 'DISETUJUI' : 'DITOLAK'}
                </span>
                <button onClick={() => setShowDetail(row)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#213448] hover:text-white transition-all">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-16 bg-slate-50/50 rounded-[35px] border-2 border-dashed border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Belum ada riwayat pengajuan
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showDetail && (
        <div className="fixed inset-0 bg-[#213448]/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-[#213448] mb-1">Detail Alasan</h3>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6">
               {leaveTypeMap[showDetail.leave_type] || showDetail.leave_type}
            </p>
            <div className="bg-slate-50 p-6 rounded-[25px] text-[#213448] text-sm font-medium leading-relaxed border border-slate-100 mb-8 min-h-[100px]">
              "{showDetail.reason}"
            </div>
            <button 
              onClick={() => setShowDetail(null)} 
              className="w-full bg-[#213448] text-white py-4 rounded-[20px] font-black text-xs tracking-[0.2em] transition-all active:scale-95 shadow-lg"
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