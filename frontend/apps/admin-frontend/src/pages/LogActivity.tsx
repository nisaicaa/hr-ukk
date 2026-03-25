import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { showToast } from "../../../../services/helper/swal";
import { History, Search, Filter, CalendarDays } from "lucide-react";

const LogActivityPage = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (month && year) { params.month = month; params.year = year; }
      if (startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }
      if (year && !month) { params.year = year; }

      const res = await apiClient.get("/logs", { params });
      setLogs(res.data.data);
    } catch (error: any) {
      console.error(error);
      showToast("Gagal mengambil data log", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8fafc', 
      minHeight: '100%', 
      fontFamily: "'Inter', sans-serif" 
    }}>
      
      {/* HEADER */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        marginBottom: '28px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          backgroundColor: '#eff6ff', 
          padding: '10px', 
          borderRadius: '12px',
          color: '#2563eb'
        }}>
          <History size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Log Aktivitas Sistem
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            Pantau seluruh riwayat perubahan dan aksi pengguna dalam sistem.
          </p>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#475569' }}>
          <Filter size={18} />
          <span style={{ fontWeight: '600' }}>Filter Data</span>
        </div>
        
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Dari Tanggal</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Sampai Tanggal</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Bulan</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={inputStyle}>
              <option value="">Semua Bulan</option>
              {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div style={inputGroupStyle}>
            <label style={labelStyle}>Tahun</label>
            <input type="number" placeholder="2026" value={year} onChange={(e) => setYear(e.target.value)} style={{ ...inputStyle, width: "100px" }} />
          </div>

          <button onClick={fetchLogs} style={buttonStyle}>
            <Search size={18} />
            Terapkan Filter
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={thStyle}>WAKTU</th>
              <th style={thStyle}>ADMIN</th>
              <th style={thStyle}>AKSI</th>
              <th style={thStyle}>TABEL</th>
              <th style={thStyle}>DESKRIPSI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Memuat data...</td></tr>
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id_log} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '600', color: '#334155' }}>
                      {new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        {log.user?.username?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <span style={{ fontWeight: '500' }}>{log.user?.username || 'System'}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ ...badgeStyle, ...getActionColor(log.action) }}>{log.action}</span>
                  </td>
                  <td style={tdStyle}>
                    <code style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', color: '#475569' }}>
                      {log.table_name}
                    </code>
                  </td>
                  <td style={{ ...tdStyle, color: '#64748b', fontSize: '14px' }}>{log.description}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                  <CalendarDays size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                  <p style={{ color: '#94a3b8', margin: 0 }}>Tidak ada data aktivitas ditemukan</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styles
const inputGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: '600', color: '#64748b' };
const inputStyle: React.CSSProperties = { padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '14px' };
const thStyle: React.CSSProperties = { padding: '16px', textAlign: 'left', fontSize: '12px', color: '#64748b', fontWeight: '700' };
const tdStyle: React.CSSProperties = { padding: '16px' };
const badgeStyle: React.CSSProperties = { padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' };

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#2563eb", color: "white", border: "none", padding: "0 20px", 
  borderRadius: "8px", cursor: "pointer", fontWeight: "600", height: "40px",
  display: 'flex', alignItems: 'center', gap: '8px'
};

const getActionColor = (action: string) => {
  switch (action) {
    case "CREATE": return { backgroundColor: '#dcfce7', color: '#15803d' };
    case "UPDATE": return { backgroundColor: '#fef3c7', color: '#b45309' };
    case "DELETE": return { backgroundColor: '#fee2e2', color: '#b91c1c' };
    default: return { backgroundColor: '#f1f5f9', color: '#475569' };
  }
};

export default LogActivityPage;