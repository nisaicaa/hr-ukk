import { useEffect, useState } from "react";
// ✅ IMPORT useNavigate
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/api";
import { showToast } from "../../../../services/helper/swal";
// ✅ IMPORT ArrowLeft
import { FileText, Download, CalendarDays, ArrowLeft } from "lucide-react";
// ✅ IMPORT JSPDF
import { jsPDF } from "jspdf";

const Payslip = () => {
  const navigate = useNavigate(); // ✅ INITIALIZE NAVIGATE
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/payroll/my-payroll");
      setData(res.data.data || []);
    } catch (error: any) {
      showToast("Gagal load slip gaji", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGIKA PERHITUNGAN
  const calculateDeductions = (payroll: any) => {
    const basicSalary = Number(payroll.total_salary) || 0;
    const attendanceRate = (payroll.total_attendance || 0) / 22; // 22 hari kerja
    
    const deductions = {
      attendanceCut: attendanceRate < 0.8 ? basicSalary * 0.05 : 0, // 5% kalau <80%
      pph21: basicSalary > 5000000 ? basicSalary * 0.05 : 0, // Mock PPh21 5%
      bpjsKesehatan: basicSalary * 0.01, // 1% BPJS Kesehatan
      bpjsKetenagakerjaan: basicSalary * 0.02, // 2% BPJS Ketenagakerjaan
      total: 0
    };
    
    deductions.total = deductions.attendanceCut + deductions.pph21 + 
                      deductions.bpjsKesehatan + deductions.bpjsKetenagakerjaan;
    
    return deductions;
  };

  // ✅ FUNGSI DOWNLOAD PDF MENGGUNAKAN JSPDF
  const handleDownloadPDF = async (id_payroll: number) => {
    const payslipData = data.find(p => p.id_payroll === id_payroll);
    if (!payslipData?.payslips?.length) {
      showToast("Payslip belum siap", "error");
      return;
    }

    const deductions = calculateDeductions(payslipData);
    
    // Perhitungan nilai berdasarkan logika Anda
    const overtimeBonus = (payslipData.total_overtime / 60) * 50000;
    const subtotal = Number(payslipData.total_salary || 0) + overtimeBonus;
    const netSalary = subtotal - deductions.total;

    // Inisialisasi jsPDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // --- KONTEN PDF ---
    const margin = 15;
    let y = margin;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("SLIP GAJI RESMI", 105, y, { align: "center" });
    y += 7;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("HR-UKK SYSTEM | PT. UKK BANDUNG", 105, y, { align: "center" });
    y += 10;
    doc.line(margin, y, 200 - margin, y); // Garis pembatas
    y += 10;

    // Informasi Karyawan
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMASI KARYAWAN", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Periode: ${payslipData.periode_month.toString().padStart(2, '0')}/${payslipData.periode_year}`, margin, y);
    y += 5;
    doc.text(`Nama   : ${payslipData.employee?.full_name || 'N/A'}`, margin, y);
    y += 5;
    doc.text(`NIK    : ${payslipData.employee?.nik || 'N/A'}`, margin, y);
    y += 5;
    doc.text(`Jabatan: ${payslipData.employee?.jabatan || 'Staff'}`, margin, y);
    y += 12;

    // Rincian
    doc.setFont("helvetica", "bold");
    doc.text("RINCIAN PENGGAJIAN", margin, y);
    y += 8;

    // Table Header
    doc.setFontSize(9);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 5, 180, 7, 'F');
    doc.text("Deskripsi", margin + 2, y);
    doc.text("Nominal", 170, y, { align: "right" });
    y += 8;

    // Table Content
    doc.setFont("helvetica", "normal");
    
    // Gaji Pokok & Lembur
    doc.text("Gaji Pokok", margin + 2, y);
    doc.text(`Rp ${Number(payslipData.total_salary || 0).toLocaleString('id-ID')}`, 170, y, { align: "right" });
    y += 5;
    doc.text(`Overtime Bonus (${payslipData.total_overtime}m)`, margin + 2, y);
    doc.text(`Rp ${overtimeBonus.toLocaleString('id-ID')}`, 170, y, { align: "right" });
    y += 5;
    
    doc.line(margin, y, 200 - margin, y);
    y += 6;
    
    // Subtotal
    doc.setFont("helvetica", "bold");
    doc.text("SUBTOTAL", margin + 2, y);
    doc.text(`Rp ${subtotal.toLocaleString('id-ID')}`, 170, y, { align: "right" });
    y += 8;
    
    doc.line(margin, y, 200 - margin, y);
    y += 6;

    // Potongan
    doc.setFont("helvetica", "bold");
    doc.text("POTONGAN", margin + 2, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    doc.text("Potongan Kehadiran (<80%)", margin + 5, y);
    doc.text(`-Rp ${deductions.attendanceCut.toLocaleString('id-ID')}`, 170, y, { align: "right" });
    y += 4;
    doc.text("PPh 21", margin + 5, y);
    doc.text(`-Rp ${deductions.pph21.toLocaleString('id-ID')}`, 170, y, { align: "right" });
    y += 4;
    doc.text("BPJS Kesehatan (1%)", margin + 5, y);
    doc.text(`-Rp ${deductions.bpjsKesehatan.toLocaleString('id-ID')}`, 170, y, { align: "right" });
    y += 4;
    doc.text("BPJS Ketenagakerjaan (2%)", margin + 5, y);
    doc.text(`-Rp ${deductions.bpjsKetenagakerjaan.toLocaleString('id-ID')}`, 170, y, { align: "right" });
    y += 6;
    
    doc.line(margin, y, 200 - margin, y);
    y += 8;

    // Total Bersih
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL BERSIH DITERIMA", margin + 2, y);
    doc.text(`Rp ${netSalary.toLocaleString('id-ID')}`, 170, y, { align: "right" });
    
    y += 15;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, margin, y);

    // Save PDF
    doc.save(`SLIP_GAJI_${payslipData.periode_month}_${payslipData.periode_year}_${payslipData.employee?.nik || 'EMP'}.pdf`);
    
    showToast("✅ PDF Slip Gaji berhasil di-download!", "success");
  };

  return (
    <div style={{ 
      padding: '32px', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      animation: 'fadeIn 0.5s ease-in-out'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* HEADER */}
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0,0, 0.1)',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* ✅ TOMBOL KEMBALI */}
            <button 
              onClick={() => navigate(-1)} 
              style={{
                padding: '12px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '16px',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '900',
                color: '#1e293b',
                margin: 0
              }}>
                Slip Gaji Saya
              </h2>
              <p style={{
                color: '#64748b',
                fontSize: '16px',
                margin: '8px 0 0 0'
              }}>
                Total: <strong>{data.length}</strong> slip tersedia
              </p>
            </div>
          </div>
          <FileText style={{ width: '48px', height: '48px', color: '#10b981' }} />
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{
            background: 'white',
            borderRadius: '28px',
            padding: '80px 20px',
            textAlign: 'center' as const,
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '56px', height: '56px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #10b981',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 24px'
            }}></div>
            <p style={{ fontSize: '18px', color: '#64748b' }}>Memuat...</p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !data.length && (
          <div style={{
            background: 'white',
            borderRadius: '28px',
            padding: '100px 40px',
            textAlign: 'center' as const,
            border: '1px solid #e2e8f0'
          }}>
            <FileText style={{ width: '72px', height: '72px', opacity: 0.5, color: '#94a3b8', margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: '24px', color: '#64748b', margin: '0 0 12px' }}>
              Belum ada slip gaji
            </h3>
            <p style={{ fontSize: '16px', color: '#94a3b8' }}>
              Tunggu finance generate payroll & payslip
            </p>
          </div>
        )}

        {/* LIST */}
        {!loading && data.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {data.map((row: any) => {
              const deductions = calculateDeductions(row);
              const netSalary = (row.total_salary || 0) + (row.total_overtime / 60 * 50000) - deductions.total;
              
              return (
                <div key={row.id_payroll} style={{
                  background: 'white',
                  padding: '28px',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                }}>
                  {/* PERIODE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>
                        Periode {row.periode_month}/{row.periode_year}
                      </p>
                      <p style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: '4px 0 0 0' }}>
                        Rp {netSalary.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '700',
                      background: row.payslips?.length ? '#d1fae5' : '#f8fafc',
                      color: row.payslips?.length ? '#065f46' : '#64748b'
                    }}>
                      {row.payslips?.length ? '✅ Siap Download' : '⏳ Menunggu'}
                    </span>
                  </div>

                  {/* RINCIAN */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '15px' }}>
                      <span>Gaji Pokok</span>
                      <span style={{ fontWeight: '700' }}>Rp {Number(row.total_salary).toLocaleString('id-ID')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', color: '#ef4444' }}>
                      <span>Potongan:</span>
                      <div style={{ textAlign: 'right' as const }}>
                        <div>Attendance {Math.round((deductions.attendanceCut/row.total_salary)*100)}%: -Rp {Number(deductions.attendanceCut).toLocaleString('id-ID')}</div>
                        <div>PPh21: -Rp {Number(deductions.pph21).toLocaleString('id-ID')}</div>
                        <div>BPJS Kes: -Rp {Number(deductions.bpjsKesehatan).toLocaleString('id-ID')}</div>
                        <div>BPJS Ket: -Rp {Number(deductions.bpjsKetenagakerjaan).toLocaleString('id-ID')}</div>
                      </div>
                    </div>
                  </div>

                  {/* BUTTON */}
                  {row.payslips?.length > 0 ? (
                    <button 
                      onClick={() => handleDownloadPDF(row.id_payroll)}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      <Download style={{ width: '18px', height: '18px', display: 'inline', marginRight: '8px' }} />
                      Download PDF Resmi
                    </button>
                  ) : (
                    <div style={{
                      padding: '20px',
                      background: '#fef3c7',
                      borderRadius: '12px',
                      textAlign: 'center' as const,
                      color: '#92400e',
                      border: '2px dashed #f59e0b'
                    }}>
                      <CalendarDays style={{ width: '24px', height: '24px', margin: '0 auto 8px' }} />
                      Menunggu approval finance
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
};

export default Payslip;