import { useEffect, useState, useRef } from 'react';
import apiClient from '../../../../services/api';
import { handleError } from '../../../../services/handler/error';
import { showSuccess, showConfirm, showToast } from '../../../../services/helper/swal';
import { 
  Plus, Edit, Trash2, X, Search, Upload,
  FileSpreadsheet, Eye, UserCheck, Briefcase, Calendar, Mail, CreditCard, DollarSign, User
} from 'lucide-react';

interface Employee {
  id_employee: number;
  nik: string;
  full_name: string;
  departemen: string;
  jabatan: string;
  birth_date: string;
  hire_date: string;
  employee_status: string;
  basic_salary: number;
  phone_number?: string;
  bank_name?: string;
  bank_account?: string;
  bank_holder?: string;
  user: {
    id_user: number;
    username: string;
    email: string;
    role: string;
  };
}

interface BulkResult {
  summary: string;
  results: any[];
  errors: string[];
  password?: string;
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [importStep, setImportStep] = useState<1|2>(1);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1|2|3>(1);

  const initialForm = {
    nik: '',
    username: '',
    email: '',
    full_name: '',
    birth_date: '',
    hire_date: '',
    departemen: '',
    jabatan: '',
    basic_salary: '',
    phone_number: '',
    bank_name: '',
    bank_account: '',
    bank_holder: ''
  };
  
  const [formData, setFormData] = useState(initialForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/employees');
      setEmployees(res.data.data || []);
    } catch (e) { handleError(e); } 
    finally { setLoading(false); }
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      nik: emp.nik,
      username: emp.user.username,
      email: emp.user.email,
      full_name: emp.full_name,
      birth_date: emp.birth_date,
      hire_date: emp.hire_date,
      departemen: emp.departemen,
      jabatan: emp.jabatan,
      basic_salary: emp.basic_salary.toString(),
      phone_number: emp.phone_number || '',
      bank_name: emp.bank_name || '',
      bank_account: emp.bank_account || '',
      bank_holder: emp.bank_holder || ''
    });
    setShowModal(true);
  };

  const handleViewDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingEmployee) {
        // UPDATE employee
        await apiClient.put(`/employees/${editingEmployee.id_employee}`, {
          ...formData,
          basic_salary: Number(formData.basic_salary),
          id_user: editingEmployee.user.id_user
        });
        showToast('Data karyawan berhasil diperbarui');
      } else {
        // CREATE baru - gunakan endpoint bulk-single
        const payload = {
          nik: formData.nik.trim(),
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          username: formData.username.trim() || formData.nik.trim(),
          departemen: formData.departemen.trim(),
          jabatan: formData.jabatan.trim(),
          birth_date: formData.birth_date || new Date().toISOString().split('T')[0],
          hire_date: formData.hire_date || new Date().toISOString().split('T')[0],
          basic_salary: Number(formData.basic_salary),
          phone_number: formData.phone_number?.trim() || '',
          bank_name: formData.bank_name?.trim() || '',
          bank_account: formData.bank_account?.trim() || '',
          bank_holder: formData.bank_holder?.trim() || ''
        };
        
        await apiClient.post('/employees/bulk-single', payload);
        showSuccess('Berhasil', 'Karyawan baru telah ditambahkan. Password default: humanest26');
      }
      
      setShowModal(false);
      setFormData(initialForm);
      setEditingEmployee(null);
      setStep(1);
      fetchEmployees();
    } catch (e) { 
      handleError(e); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await showConfirm('Hapus Karyawan?', 'Data yang dihapus tidak dapat dikembalikan');
    if (confirm.isConfirmed) {
      try { 
        await apiClient.delete(`/employees/${id}`); 
        showSuccess('Terhapus', 'Data karyawan telah dihapus'); 
        fetchEmployees(); 
      } catch (e) { 
        handleError(e); 
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formDataFile = new FormData();
    formDataFile.append('excel', file);
    
    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/employees/bulk', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBulkResult(res.data);
      setImportStep(2);
      fetchEmployees();
    } catch (e) { 
      handleError(e); 
    } finally { 
      setIsSubmitting(false); 
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.departemen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Manajemen Karyawan</h1>
          <p className="text-sm text-slate-500 font-medium">Total {employees.length} karyawan terdaftar</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setShowImportModal(true); setImportStep(1); }}
            className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition active:scale-95 shadow-sm"
          >
            <FileSpreadsheet size={20} className="text-emerald-500" />
            Import Excel
          </button>
          <button 
            onClick={() => { setEditingEmployee(null); setFormData(initialForm); setShowModal(true); setStep(1); }}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition active:scale-95 shadow-lg shadow-emerald-200"
          >
            <Plus size={20} />
            Tambah Karyawan
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Cari berdasarkan NIK, Nama, Email, atau Departemen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition font-medium shadow-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Karyawan</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Kontak</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Departemen & Jabatan</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Gaji Pokok</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">Memuat data...</td></tr>
              ) : filteredEmployees.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">Tidak ada data ditemukan</td></tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id_employee} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                          {emp.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{emp.user.username}</p>
                          <p className="text-xs text-slate-400">{emp.nik}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-600">{emp.user.email}</p>
                      {emp.phone_number && <p className="text-sm font-medium text-slate-600">📱 {emp.phone_number}</p>}
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold mr-2">{emp.departemen}</span>
                      <span className="text-sm text-slate-500 font-medium">{emp.jabatan}</span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-700 text-sm">Rp {emp.basic_salary.toLocaleString('id-ID')}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleViewDetail(emp)} className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"><Eye size={18} /></button>
                        <button onClick={() => handleEdit(emp)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(emp.id_employee)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREATE/EDIT (Step Form) */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] p-8 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">
                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData(initialForm);
                  setEditingEmployee(null);
                  setStep(1);
                }}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP PROGRESS */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      step === s ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* STEP 1: Informasi Umum */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">NIK</label>
                    <input
                      required
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                      placeholder="2024001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Username</label>
                    <input
                      required={!editingEmployee}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Email</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                      placeholder="email@perusahaan.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Nama Lengkap</label>
                    <input
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                      placeholder="Nama Lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Tanggal Lahir</label>
                    <input
                      required={!editingEmployee}
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Tanggal Masuk</label>
                    <input
                      required={!editingEmployee}
                      type="date"
                      value={formData.hire_date}
                      onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Jabatan & Departemen */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Departemen</label>
                    <input
                      required
                      value={formData.departemen}
                      onChange={(e) => setFormData({ ...formData, departemen: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Jabatan</label>
                    <input
                      required
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Gaji & Bank */}
              {step === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Gaji Pokok</label>
                    <input
                      required
                      type="number"
                      value={formData.basic_salary}
                      onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                      placeholder="5000000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">No. HP</label>
                    <input
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                      placeholder="081234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Bank</label>
                    <input
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                      placeholder="Bank BCA"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">No. Rekening</label>
                    <input
                      value={formData.bank_account}
                      onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Pemilik Rekening</label>
                    <input
                      value={formData.bank_holder}
                      onChange={(e) => setFormData({ ...formData, bank_holder: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition font-medium text-slate-700"
                      placeholder="Nama Pemilik"
                    />
                  </div>
                </div>
              )}

              {/* NAVIGATION BUTTONS */}
              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-300 transition"
                  >
                    Kembali
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="ml-auto px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition"
                  >
                    Lanjut
                  </button>
                ) : (
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="ml-auto px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Memproses...' : editingEmployee ? 'Simpan Perubahan' : 'Simpan Data Karyawan'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Import Data via Excel</h2>
              <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
                       {importStep === 1 ? (
              <div className="space-y-6 text-center">
                <div onClick={() => fileInputRef.current?.click()} className="group relative border-4 border-dashed border-slate-100 hover:border-emerald-500/30 rounded-[2rem] p-12 transition-all cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv" className="hidden" />
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition"><Upload size={32} /></div>
                  <h3 className="text-lg font-black text-slate-700 mb-1">Pilih File Excel</h3>
                  <p className="text-sm text-slate-400 font-medium italic">Format: .xlsx, .xls, .csv</p>
                </div>
                <button
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8,nik,username,email,full_name,departemen,jabatan,birth_date,hire_date,basic_salary,phone_number,bank_name,bank_account,bank_holder\n";
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "template_karyawan.csv");
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition"
                >
                  Download Template CSV
                </button>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
                  <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-black text-emerald-900 text-lg">Proses Selesai!</h3>
                  <p className="text-emerald-700 font-medium text-sm mt-1">{bulkResult?.summary}</p>
                  {bulkResult?.errors.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-xs text-yellow-800 font-medium">Error ({bulkResult.errors.length}):</p>
                      <pre className="text-xs text-yellow-700 mt-1 max-h-32 overflow-auto">{bulkResult.errors.join('\n')}</pre>
                    </div>
                  )}
                </div>
                <button onClick={() => { 
                  setShowImportModal(false); 
                  setImportStep(1); 
                  setBulkResult(null); 
                }} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black transition active:scale-[0.98]">
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="bg-emerald-600 p-8 text-white relative">
              <button onClick={() => setShowDetailModal(false)} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition"><X size={20} /></button>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-3xl font-black mb-4">{selectedEmployee.user.username.charAt(0).toUpperCase()}</div>
              <h2 className="text-2xl font-black">{selectedEmployee.user.username}</h2>
              <p className="opacity-80 font-medium">Karyawan {selectedEmployee.employee_status}</p>
            </div>
            <div className="p-8 space-y-6">
              {/* Informasi Umum */}
              <div className="space-y-4">
                <h3 className="font-black text-slate-500 uppercase text-xs tracking-widest">Informasi Umum</h3>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Mail size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                    <p className="font-bold text-slate-700">{selectedEmployee.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Briefcase size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jabatan & Departemen</p>
                    <p className="font-bold text-slate-700">{selectedEmployee.jabatan} — {selectedEmployee.departemen}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Calendar size={20} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Bergabung</p>
                    <p className="font-bold text-slate-700">{new Date(selectedEmployee.hire_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                {selectedEmployee.phone_number && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><User size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No. HP</p>
                      <p className="font-bold text-slate-700">{selectedEmployee.phone_number}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informasi Bank & Gaji */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h3 className="font-black text-slate-500 uppercase text-xs tracking-widest">Informasi Bank & Gaji</h3>
                {selectedEmployee.bank_name && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><CreditCard size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank</p>
                      <p className="font-bold text-slate-700">{selectedEmployee.bank_name} — {selectedEmployee.bank_account}</p>
                    </div>
                  </div>
                )}
                {selectedEmployee.bank_holder && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><User size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pemilik Rekening</p>
                      <p className="font-bold text-slate-700">{selectedEmployee.bank_holder}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gaji Pokok</p>
                    <p className="text-xl font-black text-emerald-600">Rp {selectedEmployee.basic_salary.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xs">{selectedEmployee.user.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckCircle2 = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default EmployeeManagement;
