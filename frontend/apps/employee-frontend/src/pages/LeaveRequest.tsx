import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/api";
import { 
  Eye, Send, FileText, Calendar as CalendarIcon, 
  X, ChevronLeft, Loader2, ChevronDown, Paperclip 
} from "lucide-react";
import { showSuccess, showError } from "../../../../services/helper/swal";

const LeaveRequest = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    leave_type: "ANNUAL",
    start_date: "",
    end_date: "",
    reason: "",
  });

  const [attachment, setAttachment] = useState<File | null>(null);
  const [showDetail, setShowDetail] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await apiClient.get("/leave");
      setData(res.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  /* =============================
      VALIDASI TANGGAL FRONTEND
  ============================= */
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const minStartDate = form.leave_type === "SICK" ? todayStr : tomorrowStr;

  /* =============================
      SUBMIT
  ============================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("leave_type", form.leave_type);
      formData.append("start_date", form.start_date);
      formData.append("end_date", form.end_date);
      formData.append("reason", form.reason);

      if (attachment) {
        formData.append("attachment", attachment);
      }

      await apiClient.post("/leave", formData);
      showSuccess("Berhasil", "Pengajuan cuti Anda telah dikirim.");

      setForm({
        leave_type: "ANNUAL",
        start_date: "",
        end_date: "",
        reason: "",
      });
      setAttachment(null);
      fetchData();
    } catch (error) {
      showError("Gagal", "Terjadi kesalahan saat mengirim pengajuan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold transition-colors group"
      >
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
          <ChevronLeft size={20} />
        </div>
        Kembali ke Dashboard
      </button>

      {/* HEADER */}
      <div className="flex items-center justify-between bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Cuti & Izin
          </h2>
          <p className="text-slate-500 font-medium">
            Formulir pengajuan ketidakhadiran karyawan.
          </p>
        </div>
        <div className="hidden md:flex p-5 bg-emerald-50 text-emerald-600 rounded-[28px]">
          <Send size={28} />
        </div>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* TYPE */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Tipe Ketidakhadiran
            </label>
            <div className="relative group">
              <select
                value={form.leave_type}
                className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-emerald-500 appearance-none font-bold text-slate-700 transition-all outline-none"
                onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
              >
                <option value="ANNUAL">Cuti Tahunan</option>
                <option value="SICK">Sakit</option>
                <option value="SPECIAL">Cuti Khusus</option>
                <option value="UNPAID">Cuti Tanpa Gaji</option>
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors"
                size={20}
              />
            </div>
          </div>

          {/* FILE */}
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Lampiran Pendukung
            </label>
            <label className="flex items-center gap-3 w-full bg-slate-50 border-2 border-dashed border-slate-200 p-4 rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-emerald-600 transition-colors">
                <Paperclip size={18} />
              </div>
              <span className="text-sm font-bold text-slate-500 truncate group-hover:text-emerald-700">
                {attachment ? attachment.name : "Pilih file (PDF/JPG)"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e: any) => setAttachment(e.target.files[0])}
              />
            </label>
          </div>
        </div>

        {/* DATE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Tanggal Mulai
            </label>
            <div className="relative">
              <input
                type="date"
                required
                min={minStartDate}
                className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-emerald-500 font-bold text-slate-700 outline-none transition-all"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
              <CalendarIcon
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
              Tanggal Selesai
            </label>
            <div className="relative">
              <input
                type="date"
                required
                min={form.start_date || minStartDate}
                className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:bg-white focus:border-emerald-500 font-bold text-slate-700 outline-none transition-all"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
              <CalendarIcon
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                size={18}
              />
            </div>
          </div>
        </div>

        {/* REASON */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
            Alasan Detail
          </label>
          <textarea
            placeholder="Berikan keterangan lengkap mengenai alasan pengajuan Anda..."
            rows={4}
            className="w-full bg-slate-50 border-2 border-transparent p-5 rounded-[30px] focus:bg-white focus:border-emerald-500 font-medium text-slate-700 outline-none transition-all resize-none"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </div>

        {/* BUTTON */}
        <button
          disabled={loading}
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white py-6 rounded-[30px] font-black text-lg shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-4 active:scale-95"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Send size={22} /> KIRIM PENGAJUAN
            </>
          )}
        </button>
      </form>

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Riwayat Pengajuan</h3>
          <div className="px-4 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-400">Total: {data.length}</div>
        </div>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis</th>
                <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Periode</th>
                <th className="p-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row) => (
                <tr key={row.id_leave} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <span className="font-bold text-slate-700 block text-sm">{row.leave_type}</span>
                    <span className="text-[10px] text-slate-400 font-medium italic">Sent Recently</span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100/50 w-fit px-3 py-1.5 rounded-lg">
                      <CalendarIcon size={12} className="text-emerald-500" />
                      {new Date(row.start_date).toLocaleDateString("id-ID")} - {new Date(row.end_date).toLocaleDateString("id-ID")}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter uppercase shadow-sm ${
                      row.leave_status === 'APPROVED' ? 'bg-emerald-500 text-white' : 
                      row.leave_status === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-white'
                    }`}>
                      {row.leave_status}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => setShowDetail(row)} 
                      className="p-3 bg-white hover:bg-emerald-600 rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-white transition-all transform hover:scale-110"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-10 rounded-[50px] w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowDetail(null)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            
            <div className="mb-8">
               <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-4">
                  <FileText size={32} />
               </div>
               <h3 className="text-2xl font-black text-slate-800">Detail Cuti</h3>
               <p className="text-slate-400 font-medium">Informasi lengkap pengajuan anda.</p>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-[30px] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Alasan Pengajuan</p>
                <p className="text-slate-700 font-bold leading-relaxed">{showDetail.reason}</p>
              </div>

              {showDetail.attachment && (
                <a 
                  href={`${import.meta.env.VITE_API_URL}/uploads/${showDetail.attachment}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-between p-5 bg-emerald-600 hover:bg-emerald-700 rounded-[25px] group transition-all shadow-lg shadow-emerald-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-xl text-white">
                      <FileText size={20} />
                    </div>
                    <span className="text-sm font-black text-white">Lihat Lampiran</span>
                  </div>
                  <ChevronLeft className="rotate-180 text-white/60 group-hover:translate-x-1 transition-transform" />
                </a>
              )}
            </div>

            <button 
              onClick={() => setShowDetail(null)} 
              className="w-full mt-10 bg-slate-100 hover:bg-slate-200 text-slate-600 py-5 rounded-[25px] font-black transition-colors"
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