import { useEffect, useState } from "react";
// ✅ IMPORT useNavigate
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/api";
import { Eye, Clock3, ArrowLeft } from "lucide-react"; // ✅ IMPORT ArrowLeft
import { showSuccess, showToast } from "../../../../services/helper/swal";
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:7000');

const OvertimeRequest = () => {
  const navigate = useNavigate(); // ✅ INITIALIZE NAVIGATE
  const [data, setData] = useState<any[]>([]);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [form, setForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    overtime_reason: ""
  });

  useEffect(() => {
    fetchData();
    
    // Dengar perubahan status lembur
    const userId = localStorage.getItem('userId'); // Asumsi userId tersimpan
    socket.on(`overtimeStatus_${userId}`, () => {
      fetchData();
      showToast("Status pengajuan lembur Anda berubah", "info");
    });

    return () => {
      socket.off(`overtimeStatus_${userId}`);
    };
  }, []);

  const fetchData = async () => {
    const res = await apiClient.get("/overtime");
    setData(res.data.data || []);
  };

  const calculateMinutes = () => {
    if (!form.date || !form.start_time || !form.end_time) return 0;
    const start = new Date(`${form.date}T${form.start_time}`);
    const end = new Date(`${form.date}T${form.end_time}`);
    return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  };

  const totalMinutes = calculateMinutes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post("/overtime", {
        date: form.date,
        start_time: `${form.date}T${form.start_time}`,
        end_time: `${form.date}T${form.end_time}`,
        overtime_reason: form.overtime_reason
      });
      showSuccess("Berhasil", "Pengajuan lembur berhasil dikirim");
      setForm({ date: "", start_time: "", end_time: "", overtime_reason: "" });
      fetchData();
    } catch (e) {
      showToast("Gagal mengajukan lembur", "error");
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
            {/* ✅ TOMBOL KEMBALI */}
            <button 
                onClick={() => navigate(-1)} 
                className="p-3 bg-slate-50 rounded-2xl text-slate-500 hover:bg-slate-100 transition-all"
            >
                <ArrowLeft size={24} />
            </button>
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Pengajuan Lembur</h2>
                <p className="text-slate-500 font-medium">Isi formulir untuk mengajukan lembur.</p>
            </div>
        </div>
        <div className="h-16 w-16 bg-slate-100 text-slate-600 rounded-[28px] flex items-center justify-center">
          <Clock3 size={30} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Tanggal</label>
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-slate-200 p-4 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Jam Mulai</label>
            <input type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="w-full border border-slate-200 p-4 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Jam Selesai</label>
            <input type="time" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="w-full border border-slate-200 p-4 rounded-2xl" />
          </div>
        </div>

        <div className="bg-amber-50 text-amber-800 p-5 rounded-2xl flex items-center justify-between border border-amber-100">
          <div className="flex items-center gap-3">
            <Clock3 className="text-amber-500" />
            <span className="font-bold">Total Durasi</span>
          </div>
          <span className="font-black text-xl">{Math.floor(totalMinutes / 60)} jam {totalMinutes % 60} menit</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Alasan</label>
          <textarea placeholder="Alasan lembur..." value={form.overtime_reason} onChange={(e) => setForm({ ...form, overtime_reason: e.target.value })} className="border border-slate-200 p-4 rounded-2xl w-full" rows={3} required />
        </div>

        <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors">
          Kirim Pengajuan
        </button>
      </form>

      {/* History Table */}
      <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
              <th className="p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Waktu</th>
              <th className="p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Durasi</th>
              <th className="p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => {
              const duration = row.total_minutes;
              return (
                <tr key={row.id_overtime} className="hover:bg-slate-50/50">
                  <td className="p-6 font-bold text-slate-700">{new Date(row.date).toLocaleDateString("id-ID")}</td>
                  <td className="p-6 text-slate-600">
                    {new Date(row.start_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - 
                    {new Date(row.end_time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-6 font-bold text-emerald-600">{Math.floor(duration / 60)}j {duration % 60}m</td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.overtime_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : row.overtime_status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.overtime_status}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <button onClick={() => setShowDetail(row)} className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"><Eye size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-[35px] w-full max-w-sm space-y-6">
            <h3 className="text-xl font-black text-slate-800">Detail Alasan</h3>
            <div className="bg-slate-50 p-5 rounded-2xl text-slate-700 leading-relaxed font-medium">
              {showDetail.overtime_reason}
            </div>
            <button onClick={() => setShowDetail(null)} className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default OvertimeRequest;