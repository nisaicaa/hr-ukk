// OvertimeManagement.tsx (HR Frontend)
import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { Check, X, ClipboardList, Clock3 } from "lucide-react";
import { showSuccess, showToast, showConfirm } from "../../../../services/helper/swal";
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:7000');

const OvertimeManagement = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();

    // Dengar event pengajuan baru
    socket.on("newOvertimeRequest", () => {
      fetchData();
      showToast("Ada pengajuan lembur baru!", "info");
    });

    return () => {
      socket.off("newOvertimeRequest");
    };
  }, []);

  const fetchData = async () => {
    const res = await apiClient.get("/overtime");
    setData(res.data.data || []);
  };

  const handleAction = async (id: number, status: 'approve' | 'reject') => {
    const isConfirm = await showConfirm(
        status === 'approve' ? "Setujui Lembur?" : "Tolak Lembur?",
        `Yakin ingin ${status === 'approve' ? 'menyetujui' : 'menolak'} pengajuan ini?`
    );

    if (isConfirm) {
        try {
            await apiClient.patch(`/overtime/${status}/${id}`);
            showSuccess("Berhasil", `Pengajuan berhasil di-${status}`);
            fetchData();
        } catch (e) {
            showToast("Gagal melakukan aksi", "error");
        }
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Persetujuan Lembur</h2>
          <p className="text-slate-500 font-medium">Kelola pengajuan lembur karyawan.</p>
        </div>
        <div className="h-16 w-16 bg-slate-100 text-slate-600 rounded-[28px] flex items-center justify-center">
          <ClipboardList size={30} />
        </div>
      </div>

      <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Karyawan</th>
              <th className="p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
              <th className="p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Durasi</th>
              <th className="p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-center text-xs font-black text-slate-400 uppercase tracking-widest">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id_overtime} className="hover:bg-slate-50/50">
                <td className="p-6">
                    <p className="font-bold text-slate-700">{row.employee?.full_name || 'N/A'}</p>
                    <p className="text-xs text-slate-400 font-bold">{row.employee?.nik || '-'}</p>
                </td>
                <td className="p-6 font-bold text-slate-700">{new Date(row.date).toLocaleDateString("id-ID")}</td>
                <td className="p-6 font-bold text-emerald-600">{Math.floor(row.total_minutes / 60)}j {row.total_minutes % 60}m</td>
                <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.overtime_status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : row.overtime_status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.overtime_status}
                    </span>
                </td>
                <td className="p-6 text-center space-x-2">
                  {row.overtime_status === "PENDING" && (
                    <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleAction(row.id_overtime, 'approve')} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200"><Check size={18} /></button>
                        <button onClick={() => handleAction(row.id_overtime, 'reject')} className="p-2 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200"><X size={18} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default OvertimeManagement;