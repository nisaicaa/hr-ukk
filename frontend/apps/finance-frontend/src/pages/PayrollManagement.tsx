import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { showSuccess, showToast, showConfirm } from "../../../../services/helper/swal";
import { DollarSign, FileText, Plus, Trash2, RefreshCw } from "lucide-react";

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
      console.log("🔄 Fetching /payroll...");
      const res = await apiClient.get("/payroll");
      console.log("✅ PAYROLL:", res.data);
      setData(res.data.data || []);
    } catch (error: any) {
      console.error("❌ ERROR:", error.response?.status, error.response?.data);
      if (error.response?.status === 403) {
        showToast("❌ Login sebagai FINANCE dulu!", "error");
      } else if (error.response?.status === 404) {
        showToast("❌ Route payroll belum ada di backend", "error");
      } else {
        showToast("Gagal load payroll", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    const isConfirm = await showConfirm(
      "Generate Payroll?",
      `Yakin ingin generate payroll untuk ${form.periode_month}/${form.periode_year}?`
    );

    if (isConfirm) {
      try {
        console.log("🚀 POST /payroll/generate...");
        const res = await apiClient.post("/payroll/generate", form);
        showSuccess("Berhasil!", res.data.message || "Payroll berhasil di-generate");
        fetchData();
      } catch (error: any) {
        console.error("❌ GENERATE ERROR:", error.response?.data);
        showToast(error.response?.data?.message || "Gagal generate payroll", "error");
      }
    }
  };

  const handleGeneratePayslip = async (id_payroll: number) => {
    try {
      console.log("🚀 POST /payroll/payslip/", id_payroll);
      await apiClient.post(`/payroll/payslip/${id_payroll}`);
      showSuccess("Berhasil", "Payslip berhasil dibuat");
      fetchData();
    } catch (error: any) {
      console.error("❌ PAYSILP ERROR:", error.response?.data);
      showToast(error.response?.data?.message || "Gagal membuat payslip", "error");
    }
  };

  // ✅ DELETE FUNCTION
  const handleDeletePayroll = async (id_payroll: number, periode_month: number, periode_year: number) => {
    const isConfirm = await showConfirm(
      "Hapus Payroll?",
      `Yakin ingin HAPUS payroll ${periode_month}/${periode_year}? Data payslip juga akan terhapus. Bisa generate ulang setelah ini.`
    );

    if (isConfirm) {
      try {
        setDeleting(true);
        await apiClient.delete(`/payroll/${id_payroll}`);
        showSuccess("Berhasil Dihapus!", `Payroll ${periode_month}/${periode_year} berhasil dihapus`);
        fetchData();
      } catch (error: any) {
        console.error("❌ DELETE ERROR:", error.response?.data);
        showToast(error.response?.data?.message || "Gagal hapus payroll", "error");
      } finally {
        setDeleting(false);
      }
    }
  };

  // ✅ REGENERATE FUNCTION
  const handleRegeneratePayroll = async (periode_month: number, periode_year: number) => {
    try {
      console.log("🔄 REGENERATE payroll...");
      const res = await apiClient.post("/payroll/generate", { periode_month, periode_year });
      showSuccess("Berhasil Regenerate!", res.data.message || "Payroll berhasil di-generate ulang");
      fetchData();
    } catch (error: any) {
      console.error("❌ REGENERATE ERROR:", error.response?.data);
      showToast(error.response?.data?.message || "Gagal regenerate payroll", "error");
    }
  };

  return (
    <div style={{ 
      padding: '32px', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      animation: 'fadeIn 0.5s ease-in'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* HEADER & FORM GENERATE */}
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '32px',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '24px',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '900',
              color: '#1e293b',
              margin: 0,
              lineHeight: '1.2'
            }}>
              Payroll Management
            </h2>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              margin: '8px 0 0 0',
              fontWeight: '500'
            }}>
              Kelola dan generate gaji karyawan. Total: {data.length} data
            </p>
          </div>

          <form onSubmit={handleGeneratePayroll} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: '#f1f5f9',
            padding: '20px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input 
                type="number" 
                min="1" 
                max="12" 
                value={form.periode_month}
                onChange={e => setForm({...form, periode_month: parseInt(e.target.value)})}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
                placeholder="Bulan"
                required
              />
              <input 
                type="number" 
                min="2000" 
                max="2030"
                value={form.periode_year}
                onChange={e => setForm({...form, periode_year: parseInt(e.target.value)})}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  padding: '12px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
                placeholder="Tahun"
                required
              />
            </div>
            <button 
              type="submit" 
              style={{
                padding: '14px 24px',
                background: '#1e293b',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e: any) => e.target.style.background = '#334155'}
              onMouseOut={(e: any) => e.target.style.background = '#1e293b'}
            >
              <Plus style={{ width: '20px', height: '20px' }} />
              Generate Payroll
            </button>
          </form>
        </div>

        {/* TABLE */}
        <div style={{
          background: 'white',
          borderRadius: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{
              textAlign: 'center' as const,
              padding: '80px',
              color: '#64748b'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e2e8f0',
                borderTop: '4px solid #10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 24px'
              }}></div>
              <p style={{ fontSize: '16px', margin: 0 }}>Memuat data payroll...</p>
            </div>
          ) : data.length === 0 ? (
            <div style={{
              textAlign: 'center' as const,
              padding: '100px 20px',
              color: '#64748b'
            }}>
              <DollarSign style={{ 
                width: '72px', 
                height: '72px', 
                margin: '0 auto 24px', 
                opacity: 0.5 
              }} />
              <h3 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 0 12px 0',
                color: '#64748b'
              }}>
                Belum ada data payroll
              </h3>
              <p style={{ fontSize: '16px', margin: 0 }}>
                Generate payroll terlebih dahulu untuk melihat data
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{
                      padding: '20px 16px',
                      textAlign: 'left' as const,
                      fontSize: '12px',
                      fontWeight: '800' as const,
                      color: '#64748b',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      borderBottom: '2px solid #e2e8f0'
                    }}>Karyawan</th>
                    <th style={{
                      padding: '20px 16px',
                      textAlign: 'left' as const,
                      fontSize: '12px',
                      fontWeight: '800' as const,
                      color: '#64748b',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      borderBottom: '2px solid #e2e8f0'
                    }}>Periode</th>
                    <th style={{
                      padding: '20px 16px',
                      textAlign: 'left' as const,
                      fontSize: '12px',
                      fontWeight: '800' as const,
                      color: '#64748b',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      borderBottom: '2px solid #e2e8f0'
                    }}>Kehadiran</th>
                    <th style={{
                      padding: '20px 16px',
                      textAlign: 'left' as const,
                      fontSize: '12px',
                      fontWeight: '800' as const,
                      color: '#64748b',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      borderBottom: '2px solid #e2e8f0'
                    }}>Gaji Bersih</th>
                    <th style={{
                      padding: '20px 16px',
                      textAlign: 'center' as const,
                      fontSize: '12px',
                      fontWeight: '800' as const,
                      color: '#64748b',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                      borderBottom: '2px solid #e2e8f0'
                    }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row) => (
                    <tr key={row.id_payroll} style={{
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <td style={{ padding: '20px 16px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px', marginBottom: '4px' }}>
                          {row.employee?.full_name || 'N/A'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                          {row.employee?.nik || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '20px 16px', fontWeight: '700', color: '#475569', fontSize: '16px' }}>
                        {row.periode_month}/{row.periode_year}
                      </td>
                      <td style={{ padding: '20px 16px', color: '#475569', fontSize: '14px' }}>
                        H: {row.total_attendance || 0} | C: {row.total_leave || 0} | L: {row.total_overtime || 0}
                      </td>
                      <td style={{ padding: '20px 16px', fontWeight: '900', color: '#059669', fontSize: '18px' }}>
                        Rp {Number(row.total_salary || 0).toLocaleString('id-ID')}
                      </td>
                      <td style={{ padding: '20px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                          {/* Generate Payslip */}
                          {row.payslips?.length === 0 ? (
                            <button 
                              onClick={() => handleGeneratePayslip(row.id_payroll)}
                              style={{
                                padding: '8px 16px',
                                background: '#d1fae5',
                                color: '#065f46',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <FileText style={{ width: '16px', height: '16px' }} />
                              Payslip
                            </button>
                          ) : (
                            <span style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#059669',
                              background: '#d1fae5',
                              padding: '6px 12px',
                              borderRadius: '9999px'
                            }}>
                              Payslip ✓
                            </span>
                          )}
                          
                          {/* DELETE & REGENERATE BUTTONS */}
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button 
                              onClick={() => handleDeletePayroll(row.id_payroll, row.periode_month, row.periode_year)}
                              disabled={deleting}
                              style={{
                                padding: '6px 10px',
                                background: deleting ? '#f3f4f6' : '#fee2e2',
                                color: deleting ? '#9ca3af' : '#dc2626',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: deleting ? 'not-allowed' : 'pointer',
                                opacity: deleting ? 0.6 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                              Hapus
                            </button>
                            <button 
                              onClick={() => handleRegeneratePayroll(row.periode_month, row.periode_year)}
                              style={{
                                padding: '6px 10px',
                                background: '#dbeafe',
                                color: '#1e40af',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <RefreshCw style={{ width: '14px', height: '14px' }} />
                              Ulangi
                            </button>
                          </div>
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
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default PayrollManagement;
