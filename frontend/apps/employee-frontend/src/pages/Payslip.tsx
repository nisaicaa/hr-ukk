import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../../services/api";
import { showToast } from "../../../../services/helper/swal";
import { Download, ChevronLeft, Loader2, Landmark, Calendar } from "lucide-react";
import { jsPDF } from "jspdf";

const Payslip = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // =======================
  // FETCH DATA PAYROLL
  // =======================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/payroll/my-payroll");
      setData(res.data.data || []);

      // Ambil data employee dari payroll pertama
      if (res.data.data && res.data.data.length > 0) {
        setEmployee(res.data.data[0].employee);
      }
    } catch (error: any) {
      showToast("Gagal memuat slip gaji", "error");
    } finally {
      setLoading(false);
    }
  };

  // =======================
  // PERHITUNGAN POTONGAN
  // =======================
  const calculateDeductions = (payroll: any) => {
    const basicSalary = Number(payroll.total_salary) || 0;
    const attendanceRate = (payroll.total_attendance || 0) / 22;

    const deductions = {
      attendanceCut: attendanceRate < 0.8 ? basicSalary * 0.05 : 0,
      pph21: basicSalary > 5000000 ? basicSalary * 0.05 : 0,
      bpjsKesehatan: basicSalary * 0.01,
      bpjsKetenagakerjaan: basicSalary * 0.02,
      total: 0
    };

    deductions.total =
      deductions.attendanceCut +
      deductions.pph21 +
      deductions.bpjsKesehatan +
      deductions.bpjsKetenagakerjaan;

    return deductions;
  };

  // =======================
  // DOWNLOAD PDF SLIP GAJI
  // =======================
  const handleDownloadPDF = (id_payroll: number) => {
    const payslipData = data.find((p) => p.id_payroll === id_payroll);
    if (!payslipData?.payslips?.length) {
      showToast("Slip gaji belum siap", "error");
      return;
    }

    const deductions = calculateDeductions(payslipData);
    const overtimeBonus = (payslipData.total_overtime / 60) * 50000;
    const subtotal =
      Number(payslipData.total_salary || 0) + overtimeBonus;
    const netSalary = subtotal - deductions.total;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margin = 15;
    let y = margin;

    // ===== HEADER =====
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("SLIP GAJI", 105, y, { align: "center" });
    y += 7;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("HumaNest HRIS", 105, y, { align: "center" });
    y += 10;

    doc.line(margin, y, 200 - margin, y);
    y += 10;

    // ===== INFORMASI KARYAWAN =====
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMASI KARYAWAN", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.text(
      `Periode: ${new Intl.DateTimeFormat("id-ID", {
        month: "long",
        year: "numeric"
      }).format(
        new Date(
          payslipData.periode_year,
          payslipData.periode_month - 1
        )
      )}`,
      margin,
      y
    );
    y += 5;

    doc.text(`Nama : ${payslipData.employee?.full_name || "-"}`, margin, y);
    y += 5;
    doc.text(`NIK  : ${payslipData.employee?.nik || "-"}`, margin, y);
    y += 5;

    if (payslipData.employee?.hire_date) {
      doc.text(
        `Tanggal Bergabung : ${new Date(
          payslipData.employee.hire_date
        ).toLocaleDateString("id-ID")}`,
        margin,
        y
      );
      y += 8;
    }

    // ===== RINCIAN PENGGAJIAN =====
    doc.setFont("helvetica", "bold");
    doc.text("RINCIAN PENGGAJIAN", margin, y);
    y += 8;

    const addRow = (label: string, value: number, isNegative = false) => {
      doc.setFont("helvetica", "normal");
      doc.text(label, margin + 2, y);
      doc.text(
        `${isNegative ? "- " : ""}Rp ${value.toLocaleString("id-ID")}`,
        170,
        y,
        { align: "right" }
      );
      y += 6;
    };

    addRow("Gaji Pokok", Number(payslipData.total_salary));
    addRow("Bonus Lembur", overtimeBonus);
    addRow("Potongan Absensi", deductions.attendanceCut, true);
    addRow("PPh 21", deductions.pph21, true);
    addRow("BPJS Kesehatan", deductions.bpjsKesehatan, true);
    addRow("BPJS Ketenagakerjaan", deductions.bpjsKetenagakerjaan, true);

    doc.line(margin, y, 200 - margin, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("TAKE HOME PAY", margin + 2, y);
    doc.text(`Rp ${netSalary.toLocaleString("id-ID")}`, 170, y, {
      align: "right"
    });

    // ===== FOOTER =====
    y += 15;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Dokumen ini dihasilkan secara otomatis oleh sistem HumaNest HRIS.",
      margin,
      y
    );

    doc.save(
      `SLIP_GAJI_${payslipData.periode_month}_${payslipData.periode_year}.pdf`
    );
    showToast("Slip Gaji berhasil diunduh", "success");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-in fade-in duration-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-8 mb-8">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="p-4 bg-white rounded-[22px] border border-slate-100 shadow-sm text-[#213448] hover:bg-[#213448] hover:text-white transition-all active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#213448] tracking-tighter">
                Slip Gaji Saya
              </h1>
              <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">
                Riwayat payroll sejak awal bekerja
              </p>
              {employee?.hire_date && (
                <p className="text-xs text-slate-400 mt-1">
                  Mulai bekerja sejak{" "}
                  {new Date(employee.hire_date).toLocaleDateString("id-ID")}
                </p>
              )}
            </div>
          </div>

          <div className="hidden sm:flex p-4 bg-emerald-50 text-emerald-600 rounded-[22px] border border-emerald-100 items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-60">
                Status Akun
              </p>
              <p className="text-sm font-black italic">
                Verified Employee
              </p>
            </div>
            <Landmark size={24} />
          </div>
        </header>

        {/* CONTENT */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <Loader2 className="w-10 h-10 text-[#213448] animate-spin mb-4" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              Menarik Data Keuangan...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((row) => {
              const deductions = calculateDeductions(row);
              const overtimeBonus = (row.total_overtime / 60) * 50000;
              const netSalary =
                (Number(row.total_salary) || 0) +
                overtimeBonus -
                deductions.total;
              const isReady = row.payslips?.length > 0;

              return (
                <div
                  key={row.id_payroll}
                  className="bg-white rounded-[35px] border border-slate-100 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
                >
                  <Landmark
                    className="absolute -right-4 -top-4 text-slate-50 group-hover:text-emerald-50/50 transition-colors"
                    size={120}
                  />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest uppercase">
                        {new Intl.DateTimeFormat("id-ID", {
                          month: "long",
                          year: "numeric"
                        }).format(
                          new Date(
                            row.periode_year,
                            row.periode_month - 1
                          )
                        )}
                      </div>
                      <span
                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
                          isReady
                            ? "text-emerald-500"
                            : "text-amber-500"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isReady
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-amber-500"
                          }`}
                        />
                        {isReady ? "Tersedia" : "Proses"}
                      </span>
                    </div>

                    <div className="mb-8">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">
                        Total Diterima (THP)
                      </p>
                      <h2 className="text-3xl font-black text-[#213448] tracking-tighter">
                        Rp {netSalary.toLocaleString("id-ID")}
                      </h2>
                    </div>

                    <div className="space-y-3 mb-8 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase">
                          Gaji Pokok
                        </span>
                        <span className="text-[#213448]">
                          Rp{" "}
                          {Number(row.total_salary).toLocaleString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase">
                          Bonus Lembur
                        </span>
                        <span className="text-emerald-600">
                          + Rp {overtimeBonus.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400 uppercase">
                          Potongan
                        </span>
                        <span className="text-rose-500">
                          - Rp{" "}
                          {deductions.total.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>

                    {isReady ? (
                      <button
                        onClick={() =>
                          handleDownloadPDF(row.id_payroll)
                        }
                        className="w-full bg-[#213448] text-white py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-[#213448]/10"
                      >
                        <Download size={18} /> Download PDF
                      </button>
                    ) : (
                      <div className="w-full bg-amber-50 text-amber-600 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 border border-amber-100">
                        <Calendar size={18} /> Menunggu Verifikasi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Payslip;