import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { showSuccess, showToast, showConfirm } from "../../../../services/helper/swal";
import { DollarSign, FileText, Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";

const PayrollManagement = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    periode_month: new Date().getMonth() + 1,
    periode_year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/payroll");
      setData(res.data.data || []);
    } catch (error: any) {
      if (error.response?.status === 403) {
        showToast("❌ Akses Ditolak! Masuk sebagai FINANCE.", "error");
      } else if (error.response?.status === 404) {
        showToast("❌ Endpoint payroll tidak ditemukan di server.", "error");
      } else {
        showToast("Gagal memuat data payroll.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    const isConfirm = await showConfirm(
      "Buat Payroll?",
      `Anda akan memproses payroll untuk periode ${form.periode_month}/${form.periode_year}. Lanjutkan?`
    );

    if (isConfirm) {
      try {
        const res = await apiClient.post("/payroll/generate", form);
        showSuccess("Berhasil!", res.data.message || "Payroll berhasil dibuat");
        fetchData();
      } catch (error: any) {
        showToast(error.response?.data?.message || "Gagal membuat payroll", "error");
      }
    }
  };

  const handleGeneratePayslip = async (id_payroll: number) => {
    try {
      await apiClient.post(`/payroll/payslip/${id_payroll}`);
      showSuccess("Berhasil", "Slip gaji berhasil diterbitkan");
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal menerbitkan slip gaji", "error");
    }
  };

  const handleDeletePayroll = async (id_payroll: number, periode_month: number, periode_year: number) => {
    const isConfirm = await showConfirm(
      "Hapus Data Payroll?",
      `Yakin ingin menghapus data payroll ${periode_month}/${periode_year}? Seluruh slip gaji terkait juga akan terhapus.`
    );

    if (isConfirm) {
      try {
        setDeleting(true);
        await apiClient.delete(`/payroll/${id_payroll}`);
        showSuccess("Berhasil Dihapus!", `Data periode ${periode_month}/${periode_year} telah dibersihkan.`);
        fetchData();
      } catch (error: any) {
        showToast(error.response?.data?.message || "Gagal menghapus data", "error");
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleRegeneratePayroll = async (periode_month: number, periode_year: number) => {
    const isConfirm = await showConfirm(
        "Proses Ulang?",
        `Ingin memperbarui data payroll periode ${periode_month}/${periode_year}?`
      );
    if (!isConfirm) return;

    try {
      const res = await apiClient.post("/payroll/generate", { periode_month, periode_year });
      showSuccess("Berhasil Diperbarui!", res.data.message || "Data payroll telah disinkronkan ulang.");
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal memproses ulang", "error");
    }
  };

  return (
    <div className="payroll-container" style={{ 
      padding: 'clamp(16px, 5vw, 32px)', 
      minHeight: '100vh', 
      // Latar belakang f8fafc telah dihapus
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* HEADER & FORM GENERATE */}
        <div className="header-card" style={{
          background: 'white',
          padding: '24px',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#213448', margin: 0 }}>Manajemen Gaji</h2>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>
                    Kelola administrasi gaji. Total: <b className="text-[#547792]">{data.length}</b> entri
                </p>
            </div>
            <button 
                onClick={() => handleRegeneratePayroll(form.periode_month, form.periode_year)}
                style={{
                    padding: '10px 18px',
                    background: '#94B4C11A',
                    color: '#547792',
                    border: '1px solid #94B4C14D',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                <RefreshCw size={16} />
                Sinkronkan Periode Ini
            </button>
          </div>

          <form onSubmit={handleGeneratePayroll} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            background: '#f1f5f9',
            padding: '16px',
            borderRadius: '16px',
          }}>
            <input 
              type="number" 
              value={form.periode_month}
              min={1} max={12}
              onChange={e => setForm({...form, periode_month: parseInt(e.target.value)})}
              style={{ flex: '1 1 120px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px' }}
              placeholder="Bulan (1-12)"
              required
            />
            <input 
              type="number" 
              value={form.periode_year}
              onChange={e => setForm({...form, periode_year: parseInt(e.target.value)})}
              style={{ flex: '1 1 120px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '10px' }}
              placeholder="Tahun"
              required
            />
            <button 
              type="submit" 
              style={{
                flex: '2 1 200px',
                padding: '12px 24px',
                background: '#213448',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
            >
              <Plus size={18} />
              Generate Payroll Baru
            </button>
          </form>
        </div>

        {/* TABLE AREA */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <Loader2 className="animate-spin" style={{ margin: '0 auto', color: '#547792' }} size={40} />
              <p style={{ color: '#64748b', marginTop: '16px', fontWeight: '600' }}>Sedang memproses data...</p>
            </div>
          ) : data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
              <DollarSign style={{ width: '64px', height: '64px', margin: '0 auto 16px', opacity: 0.3 }} />
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#213448' }}>Belum Ada Data</h3>
              <p>Daftar gaji akan muncul di sini setelah Anda melakukan generate.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={thStyle}>Karyawan</th>
                    <th style={thStyle}>Periode</th>
                    <th style={thStyle}>Presensi (H | C | L)</th>
                    <th style={thStyle}>Gaji Bersih</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id_payroll} className="table-row">
                      <td style={tdStyle}>
                        <div style={{ fontWeight: '700', color: '#213448' }}>{row.employee?.full_name || 'Tidak Diketahui'}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>{row.employee?.nik || '-'}</div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: '600' }}>
                        {row.periode_month} / {row.periode_year}
                      </td>
                      <td style={tdStyle}>
                        <span title="Hadir" style={{ color: '#059669', fontWeight: '700' }}>{row.total_attendance}</span>
                        <span style={{ color: '#e2e8f0', margin: '0 8px' }}>|</span>
                        <span title="Cuti" style={{ color: '#547792', fontWeight: '700' }}>{row.total_leave}</span>
                        <span style={{ color: '#e2e8f0', margin: '0 8px' }}>|</span>
                        <span title="Lembur" style={{ color: '#f59e0b', fontWeight: '700' }}>{row.total_overtime}</span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: '800', color: '#059669', fontSize: '15px' }}>
                        Rp {Number(row.total_salary || 0).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {row.payslips?.length === 0 ? (
                            <button 
                              onClick={() => handleGeneratePayslip(row.id_payroll)}
                              title="Terbitkan Slip Gaji"
                              style={{ ...iconBtnStyle, background: '#D1FAE5', color: '#065F46' }}
                            >
                              <FileText size={18} />
                            </button>
                          ) : (
                            <div title="Slip Gaji Sudah Terbit" style={{ ...iconBtnStyle, background: '#f1f5f9', color: '#059669', cursor: 'default' }}>
                                <FileText size={18} />
                            </div>
                          )}

                          <button 
                            onClick={() => handleDeletePayroll(row.id_payroll, row.periode_month, row.periode_year)}
                            disabled={deleting}
                            title="Hapus Log"
                            style={{ 
                                ...iconBtnStyle, 
                                background: deleting ? '#f1f5f9' : '#FEE2E2', 
                                color: deleting ? '#cbd5e1' : '#B91C1C' 
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <style>{`
          .payroll-container { animation: fadeIn 0.4s ease-out; }
          .table-row { border-bottom: 1px solid #f1f5f9; transition: all 0.2s; }
          .table-row:hover { background-color: #f8fafc; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          
          @media (max-width: 768px) {
            .header-card { padding: 16px; }
            h2 { font-size: 22px !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

// Style Helpers
const thStyle: React.CSSProperties = {
  padding: '16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: '800',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  borderBottom: '2px solid #f1f5f9'
};

const tdStyle: React.CSSProperties = {
  padding: '16px',
  fontSize: '14px',
  color: '#334155'
};

const iconBtnStyle: React.CSSProperties = {
  width: '38px',
  height: '38px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'transform 0.1s, opacity 0.2s',
};

export default PayrollManagement;