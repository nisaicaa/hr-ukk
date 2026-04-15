import { useState } from "react";
import apiClient from "../../../../services/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  FileText, 
  Download, 
  Search, 
  Calendar,
  Database,
  FileDown,
  Loader2
} from "lucide-react";

// Helper Format Rupiah
const formatIDR = (number: any) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number || 0);
};

export default function FinanceReport() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/repot?month=${month}&year=${year}`);
      setTableData(res.data.table || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (tableData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Payroll");
    XLSX.writeFile(wb, `Laporan_Payroll_${month}_${year}.xlsx`);
  };

  const exportPDF = () => {
    if (tableData.length === 0) return;

    const doc = new jsPDF("l", "mm", "a4");
    const dateLabel = new Date(year, month - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

    doc.setFontSize(18);
    doc.setTextColor(33, 52, 72);
    doc.text("LAPORAN PAYROLL KARYAWAN", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Periode: ${dateLabel} | Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 22);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 25, 283, 25);

    const rows = tableData.map((item, index) => [
      index + 1,
      item.name.toUpperCase(),
      item.department.toUpperCase(),
      formatIDR(item.basicSalary),
      item.attendance,
      formatIDR(item.overtime),
      formatIDR(item.deduction),
      formatIDR(item.totalSalary),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [["NO", "NAMA KARYAWAN", "DIVISI", "GAJI POKOK", "HADIR", "LEMBUR", "POTONGAN", "TOTAL BERSIH"]],
      body: rows,
      theme: "striped",
      headStyles: { fillColor: [84, 119, 146], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        3: { halign: "right" },
        4: { halign: "center" },
        5: { halign: "right" },
        6: { halign: "right" },
        7: { halign: "right", fontStyle: "bold" },
      },
    });

    doc.save(`Laporan_Payroll_${month}_${year}.pdf`);
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', background: '#94B4C11A', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', color: '#547792'
          }}>
            <FileText size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#213448', margin: 0 }}>Laporan Keuangan</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>
              Rekapitulasi Gaji & Pengeluaran Payroll
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', 
          padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' 
        }}>
          <Calendar size={18} color="#547792" />
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>
            {new Date(year, month - 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* FILTER BOX */}
      <div style={{
        background: 'white', padding: '20px', borderRadius: '20px',
        border: '1px solid #e2e8f0', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ flex: '1 1 200px' }}>
            <select 
              value={month} 
              onChange={(e) => setMonth(Number(e.target.value))}
              style={inputStyle}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: '1 1 150px' }}>
            <input 
              type="number" 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
              style={inputStyle}
              placeholder="Tahun"
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', flex: '2 1 300px' }}>
            <button onClick={fetchReport} disabled={loading} style={btnSearchStyle}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} 
              Cari Laporan
            </button>
            <button onClick={exportPDF} disabled={tableData.length === 0} style={btnPDFStyle}>
              <FileDown size={18} /> PDF
            </button>
            <button onClick={exportExcel} disabled={tableData.length === 0} style={btnExcelStyle}>
              <Download size={18} /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* TABLE AREA */}
      <div style={{
        background: 'white', borderRadius: '24px', border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            Rincian Transaksi Payroll
          </h3>
          <div style={{ fontSize: '10px', fontWeight: '700', color: '#547792', background: '#94B4C133', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={12} /> Server Terhubung
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'white' }}>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Informasi Karyawan</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Gaji Pokok</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Kehadiran</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Lembur</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Potongan</th>
                <th style={{ ...thStyle, textAlign: 'right', background: '#f8fafc' }}>Total Bersih</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                    <Database size={48} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                    <p style={{ fontWeight: '600' }}>Belum ada data untuk periode ini.</p>
                  </td>
                </tr>
              ) : (
                tableData.map((row, i) => (
                  <tr key={i} style={rowStyle}>
                    <td style={{ ...tdStyle, textAlign: 'center', color: '#cbd5e1', fontWeight: '700' }}>{i + 1}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: '700', color: '#213448', textTransform: 'uppercase' }}>{row.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{row.department}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>{formatIDR(row.basicSalary)}</td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ background: '#f1f5f9', color: '#547792', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                        {row.attendance} HARI
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#059669', fontWeight: '600' }}>{formatIDR(row.overtime)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', color: '#dc2626', fontWeight: '600' }}>({formatIDR(row.deduction)})</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '800', color: '#213448', background: '#f8fafc' }}>
                      {formatIDR(row.totalSalary)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Styles
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', background: '#f1f5f9', 
  border: '1px solid #cbd5e1', borderRadius: '12px', 
  fontWeight: '700', color: '#334155', outline: 'none'
};

const btnSearchStyle: React.CSSProperties = {
  flex: 2, padding: '12px 24px', background: '#213448', color: 'white',
  border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
};

const btnPDFStyle: React.CSSProperties = {
  flex: 1, padding: '12px', background: '#fef2f2', color: '#dc2626',
  border: '1px solid #fee2e2', borderRadius: '12px', fontWeight: '700', 
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
};

const btnExcelStyle: React.CSSProperties = {
  flex: 1, padding: '12px', background: '#ecfdf5', color: '#059669',
  border: '1px solid #d1fae5', borderRadius: '12px', fontWeight: '700', 
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
};

const thStyle: React.CSSProperties = {
  padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '800',
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em',
  borderBottom: '2px solid #f1f5f9'
};

const tdStyle: React.CSSProperties = {
  padding: '16px 24px', fontSize: '14px', color: '#475569'
};

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid #f1f5f9'
};