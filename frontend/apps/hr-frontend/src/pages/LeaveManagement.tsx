import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { Check, X, Trash2, ClipboardList, User } from "lucide-react";
import { showSuccess, showConfirm, showToast } from "../../../../services/helper/swal";
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:7000');

const LeaveManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => { 
    fetchData(); 

    socket.on("newLeaveRequest", () => {
      fetchData();
    });

    socket.on("leaveDeleted", () => {
      fetchData();
    });

    return () => {
      socket.off("newLeaveRequest");
      socket.off("leaveDeleted");
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/leave"); 
      setData(res.data.data || []);
    } catch (error) {
      console.error(error);
      showToast("Gagal mengambil data cuti", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, status: 'approve' | 'reject') => {
    const isConfirm = await showConfirm(
      status === 'approve' ? "Setujui Pengajuan?" : "Tolak Pengajuan?",
      `Apakah anda yakin ingin ${status === 'approve' ? 'menyetujui' : 'menolak'} pengajuan ini?`
    );

    if (isConfirm) {
      try {
        const endpoint = status === 'approve' ? `/leave/approve/${id}` : `/leave/reject/${id}`;
        await apiClient.patch(endpoint);
        showSuccess("Berhasil", `Pengajuan berhasil di-${status === 'approve' ? 'setujui' : 'tolak'}`);
        fetchData();
      } catch (e: any) {
        console.error(e);
        showToast(e.response?.data?.message || "Terjadi kesalahan", "error");
      }
    }
  };

  const handleDelete = async (id: number, employeeName: string) => {
    const isConfirm = await showConfirm(
      "Hapus Pengajuan Cuti?",
      `Apakah Anda yakin ingin menghapus pengajuan cuti ${employeeName}? Tindakan ini tidak bisa dibatalkan dan lampiran akan ikut terhapus.`
    );

    if (isConfirm) {
      try {
        setDeleting(id);
        await apiClient.delete(`/leave/${id}`);
        showSuccess("Berhasil Dihapus", "Pengajuan cuti berhasil dihapus");
        fetchData();
      } catch (e: any) {
        console.error(e);
        showToast(e.response?.data?.message || "Gagal menghapus pengajuan", "error");
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
            <span className="ml-3 text-lg font-medium">Memuat data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Persetujuan Cuti</h2>
          <p className="text-slate-500 font-medium">Kelola seluruh pengajuan cuti dan izin karyawan.</p>
        </div>
        <div className="h-16 w-16 bg-slate-100 text-slate-600 rounded-[28px] flex items-center justify-center">
          <ClipboardList size={30} />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[45px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Karyawan</th>
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipe</th>
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Periode</th>
                <th className="p-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row) => (
                <tr key={row.id_leave} className="hover:bg-slate-50/30 transition-colors">
                  <td className="p-6">
                    <p className="font-bold text-slate-700">{row.employee?.full_name || 'N/A'}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{row.employee?.nik || '-'}</p>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black">
                      {row.leave_type === 'ANNUAL' ? 'Cuti Tahunan' : 
                       row.leave_type === 'SICK' ? 'Cuti Sakit' : 
                       row.leave_type === 'PERMIT' ? 'Izin' : 'Lainnya'}
                    </span>
                  </td>
                  <td className="p-6">
                    <p className="text-xs text-slate-600 font-bold">
                      {new Date(row.start_date).toLocaleDateString('id-ID')} - {new Date(row.end_date).toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">{row.reason}</p>
                    {row.attachment && (
                      <a 
                        href={`${import.meta.env.VITE_API_URL}/uploads/${row.attachment}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 underline hover:text-blue-600"
                      >
                        Lihat Lampiran
                      </a>
                    )}
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                      row.leave_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
                      row.leave_status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-200' : 
                      'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {row.leave_status === 'PENDING' ? 'Menunggu' : 
                       row.leave_status === 'APPROVED' ? 'Disetujui' : 
                       row.leave_status === 'REJECTED' ? 'Ditolak' : row.leave_status}
                    </span>
                  </td>
                  <td className="p-6">
                    {row.leave_status === "PENDING" ? (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleAction(row.id_leave, 'approve')} 
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105"
                          title="Setujui"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => handleAction(row.id_leave, 'reject')} 
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105"
                          title="Tolak"
                        >
                          <X size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(row.id_leave, row.employee?.full_name || 'Karyawan')} 
                          disabled={deleting === row.id_leave}
                          className={`p-2 rounded-xl transition-all shadow-sm hover:shadow-md hover:scale-105 ${
                            deleting === row.id_leave
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-50 text-slate-600 hover:bg-red-500 hover:text-white'
                          }`}
                          title="Hapus"
                        >
                          {deleting === row.id_leave ? (
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-[10px] font-bold text-slate-300 uppercase italic">Selesai</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {data.length === 0 && !loading && (
          <div className="text-center py-16">
            <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-500 mb-2">Belum ada pengajuan cuti</h3>
            <p className="text-slate-400">Pengajuan cuti akan muncul di sini setelah karyawan mengajukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
