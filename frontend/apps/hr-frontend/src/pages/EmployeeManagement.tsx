import { useEffect, useState, useRef } from 'react';
import apiClient from '../../../../services/api';
import { handleError } from '../../../../services/handler/error';
import { showSuccess, showConfirm, showToast } from '../../../../services/helper/swal';
import { 
  Plus, Edit, Trash2, X, Search, Upload,
  FileSpreadsheet, Eye, Briefcase, Calendar, Mail, CreditCard, User, Phone, Building, Clock
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
  const [initialFormData, setInitialFormData] = useState<any>(null);

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
    const newFormData = {
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
    };
    setFormData(newFormData);
    setInitialFormData(newFormData);
    setShowModal(true);
  };

  const handleViewDetail = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowDetailModal(true);
  };

  const hasChanges = () => {
    if (!initialFormData) return true;
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEmployee && !hasChanges()) {
      showToast('Tidak ada perubahan yang dilakukan', 'info');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingEmployee) {
        await apiClient.put(`/employees/${editingEmployee.id_employee}`, {
          ...formData,
          basic_salary: Number(formData.basic_salary),
          id_user: editingEmployee.user.id_user
        });
        showToast('Data karyawan berhasil diperbarui');
      } else {
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
      setInitialFormData(null);
      setStep(1);
      fetchEmployees();
    } catch (e) { 
      handleError(e); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleCancelEdit = () => {
    setShowModal(false);
    setFormData(initialForm);
    setEditingEmployee(null);
    setInitialFormData(null);
    setStep(1);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getYearsOfService = (hireDate: string) => {
    if (!hireDate) return '-';
    const start = new Date(hireDate);
    const today = new Date();
    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return `${months} bulan`;
    } else if (months === 0) {
      return `${years} tahun`;
    } else {
      return `${years} tahun ${months} bulan`;
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="bg-white p-8 rounded-[35px] border border-[#94B4C1]/20 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#213448] tracking-tight">Manajemen Karyawan</h2>
          <p className="text-[#547792] font-medium">Total {employees.length} karyawan terdaftar</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setShowImportModal(true); setImportStep(1); }}
            className="px-5 py-3 bg-[#94B4C1]/10 text-[#547792] rounded-2xl font-bold hover:bg-[#94B4C1]/20 transition-all flex items-center gap-2"
          >
            <FileSpreadsheet size={20} />
            Import Excel
          </button>
          <button 
            onClick={() => { setEditingEmployee(null); setFormData(initialForm); setInitialFormData(null); setShowModal(true); setStep(1); }}
            className="px-5 py-3 bg-[#213448] text-white rounded-2xl font-bold hover:bg-[#2a4058] transition-all flex items-center gap-2 shadow-lg shadow-[#213448]/20"
          >
            <Plus size={20} />
            Tambah Karyawan
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#94B4C1]" size={20} />
        <input 
          type="text"
          placeholder="Cari berdasarkan NIK, Nama, Email, atau Departemen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-5 py-4 bg-white border border-[#94B4C1]/20 rounded-2xl outline-none focus:border-[#547792] focus:ring-2 focus:ring-[#94B4C1]/30 transition-all font-medium shadow-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[35px] border border-[#94B4C1]/20 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#94B4C1]/5">
              <tr>
                <th className="p-6 text-left text-xs font-black text-[#547792] uppercase tracking-widest">Karyawan</th>
                <th className="p-6 text-left text-xs font-black text-[#547792] uppercase tracking-widest">Kontak</th>
                <th className="p-6 text-left text-xs font-black text-[#547792] uppercase tracking-widest">Departemen & Jabatan</th>
                <th className="p-6 text-left text-xs font-black text-[#547792] uppercase tracking-widest">Gaji Pokok</th>
                <th className="p-6 text-center text-xs font-black text-[#547792] uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#94B4C1]/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#94B4C1] font-medium">Memuat data...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#94B4C1] font-medium">Tidak ada data ditemukan</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id_employee} className="hover:bg-[#94B4C1]/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#213448] flex items-center justify-center text-white font-black text-lg">
                          {emp.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#213448]">{emp.user.username}</p>
                          <p className="text-xs text-[#94B4C1] font-medium">NIK: {emp.nik}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-semibold text-[#213448]">{emp.user.email}</p>
                      {emp.phone_number && (
                        <p className="text-sm text-[#547792] flex items-center gap-1 mt-1">
                          <Phone size={12} /> {emp.phone_number}
                        </p>
                      )}
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-[#94B4C1]/10 text-[#547792] rounded-xl text-xs font-bold mr-2">{emp.departemen}</span>
                      <span className="text-sm text-[#547792] font-medium">{emp.jabatan}</span>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-[#213448] text-sm">Rp {emp.basic_salary.toLocaleString('id-ID')}</p>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetail(emp)} 
                          className="p-2 text-[#94B4C1] hover:text-[#547792] hover:bg-[#94B4C1]/10 rounded-xl transition-all"
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(emp)} 
                          className="p-2 text-[#94B4C1] hover:text-[#213448] hover:bg-[#94B4C1]/10 rounded-xl transition-all"
                          title="Edit Karyawan"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id_employee)} 
                          className="p-2 text-[#94B4C1] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Hapus Karyawan"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREATE/EDIT */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[35px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#213448] p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black">
                  {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-white/20 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="flex items-center gap-2 mb-8">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      step === s ? 'bg-[#213448]' : 'bg-[#94B4C1]/30'
                    }`}
                  />
                ))}
              </div>

              {step === 1 && (
                <div className="grid grid-cols-2 gap-5">
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">NIK *</label><input required value={formData.nik} onChange={(e) => setFormData({ ...formData, nik: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="2024001" /></div>
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">Username *</label><input required={!editingEmployee} value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="username" /></div>
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">Email *</label><input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="email@perusahaan.com" /></div>
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">Nama Lengkap *</label><input required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="Nama Lengkap" /></div>
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">Tanggal Lahir</label><input required={!editingEmployee} type="date" value={formData.birth_date} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" /></div>
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">Tanggal Masuk</label><input required={!editingEmployee} type="date" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" /></div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-5">
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">Departemen *</label><input required value={formData.departemen} onChange={(e) => setFormData({ ...formData, departemen: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="Contoh: Teknologi Informasi" /></div>
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">Jabatan *</label><input required value={formData.jabatan} onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="Contoh: Senior Developer" /></div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2"><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">Gaji Pokok *</label><input required type="number" value={formData.basic_salary} onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="5000000" /></div>
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">No. HP</label><input value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="081234567890" /></div>
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">Bank</label><input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="Bank BCA" /></div>
                  <div><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">No. Rekening</label><input value={formData.bank_account} onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="1234567890" /></div>
                  <div className="col-span-2"><label className="block text-xs font-black text-[#547792] uppercase mb-2 ml-1">Pemilik Rekening</label><input value={formData.bank_holder} onChange={(e) => setFormData({ ...formData, bank_holder: e.target.value })} className="w-full px-4 py-3 bg-[#94B4C1]/5 border border-[#94B4C1]/20 focus:border-[#547792] focus:bg-white rounded-2xl outline-none transition-all font-medium text-[#213448]" placeholder="Nama Pemilik" /></div>
                </div>
              )}

              <div className="flex justify-between gap-3 mt-8 pt-4 border-t border-[#94B4C1]/10">
                {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-3 bg-[#94B4C1]/10 text-[#547792] rounded-2xl font-bold hover:bg-[#94B4C1]/20 transition-all">Kembali</button>}
                {step < 3 ? (
                  <button type="button" onClick={() => setStep(step + 1)} className="ml-auto px-6 py-3 bg-[#213448] text-white rounded-2xl font-bold hover:bg-[#2a4058] transition-all">Lanjut</button>
                ) : (
                  <div className="ml-auto flex gap-3">
                    <button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-[#94B4C1]/10 text-[#547792] rounded-2xl font-bold hover:bg-[#94B4C1]/20 transition-all">Batal</button>
                    <button disabled={isSubmitting || (editingEmployee && !hasChanges())} type="submit" className="px-6 py-3 bg-[#213448] text-white rounded-2xl font-bold hover:bg-[#2a4058] transition-all disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Memproses...' : editingEmployee ? 'Simpan Perubahan' : 'Simpan Data Karyawan'}</button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[35px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#213448] p-5 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black">Import Excel</h2>
                <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-white/20 rounded-full transition-all"><X size={20} /></button>
              </div>
            </div>
            <div className="p-6">
              {importStep === 1 ? (
                <div className="space-y-5 text-center">
                  <div onClick={() => fileInputRef.current?.click()} className="border-3 border-dashed border-[#94B4C1]/30 hover:border-[#547792]/50 rounded-2xl p-8 transition-all cursor-pointer bg-[#94B4C1]/5">
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls,.csv" className="hidden" />
                    <Upload size={36} className="text-[#547792] mx-auto mb-3" />
                    <p className="text-sm font-bold text-[#213448]">Klik untuk upload file</p>
                    <p className="text-xs text-[#94B4C1]">.xlsx, .xls, .csv</p>
                  </div>
                  <button onClick={() => { const link = document.createElement("a"); link.setAttribute("href", "data:text/csv;charset=utf-8,nik,username,email,full_name,departemen,jabatan,birth_date,hire_date,basic_salary,phone_number,bank_name,bank_account,bank_holder\n"); link.setAttribute("download", "template.csv"); link.click(); }} className="w-full py-3 bg-[#547792] text-white rounded-xl font-bold text-sm">Download Template</button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-[#94B4C1]/10 rounded-2xl p-5">
                    <CheckCircle2 size={40} className="text-[#213448] mx-auto mb-2" />
                    <h3 className="font-black text-[#213448]">Selesai!</h3>
                    <p className="text-sm text-[#547792]">{bulkResult?.summary}</p>
                    {bulkResult?.errors?.length > 0 && <pre className="text-xs text-amber-700 mt-3 max-h-24 overflow-auto">{bulkResult.errors.join('\n')}</pre>}
                  </div>
                  <button onClick={() => { setShowImportModal(false); setImportStep(1); setBulkResult(null); }} className="w-full mt-5 py-3 bg-[#213448] text-white rounded-xl font-bold">Tutup</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL - SMALL & COMPACT (NO BUTTONS AT BOTTOM) */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Compact Header with Close Button Only */}
            <div className="bg-gradient-to-r from-[#213448] to-[#547792] px-5 py-4 relative">
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-all text-white"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-xl font-black text-[#213448]">
                  {selectedEmployee.user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">{selectedEmployee.user.username}</h2>
                  <p className="text-white/70 text-xs">{selectedEmployee.full_name}</p>
                  <div className="flex gap-1.5 mt-1">
                    <span className="px-2 py-0.5 bg-white/20 rounded-md text-white text-[10px] font-bold">{selectedEmployee.user.role}</span>
                    <span className="px-2 py-0.5 bg-white/20 rounded-md text-white text-[10px] font-bold">NIK: {selectedEmployee.nik}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Content */}
            <div className="p-5 space-y-4">
              {/* Row 1 - Personal */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#94B4C1]/5 rounded-xl p-2.5">
                  <p className="text-[9px] font-black text-[#94B4C1] uppercase">Email</p>
                  <p className="text-xs font-semibold text-[#213448] truncate">{selectedEmployee.user.email}</p>
                </div>
                <div className="bg-[#94B4C1]/5 rounded-xl p-2.5">
                  <p className="text-[9px] font-black text-[#94B4C1] uppercase">No. HP</p>
                  <p className="text-xs font-semibold text-[#213448]">{selectedEmployee.phone_number || '-'}</p>
                </div>
              </div>

              {/* Row 2 - Employment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#94B4C1]/5 rounded-xl p-2.5">
                  <p className="text-[9px] font-black text-[#94B4C1] uppercase">Departemen</p>
                  <p className="text-xs font-semibold text-[#213448]">{selectedEmployee.departemen}</p>
                </div>
                <div className="bg-[#94B4C1]/5 rounded-xl p-2.5">
                  <p className="text-[9px] font-black text-[#94B4C1] uppercase">Jabatan</p>
                  <p className="text-xs font-semibold text-[#213448]">{selectedEmployee.jabatan}</p>
                </div>
              </div>

              {/* Row 3 - Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#94B4C1]/5 rounded-xl p-2.5">
                  <p className="text-[9px] font-black text-[#94B4C1] uppercase">Tanggal Lahir</p>
                  <p className="text-xs font-semibold text-[#213448]">{formatDate(selectedEmployee.birth_date)}</p>
                </div>
                <div className="bg-[#94B4C1]/5 rounded-xl p-2.5">
                  <p className="text-[9px] font-black text-[#94B4C1] uppercase">Tanggal Masuk</p>
                  <p className="text-xs font-semibold text-[#213448]">{formatDate(selectedEmployee.hire_date)}</p>
                </div>
              </div>

              {/* Row 4 - Bank */}
              {(selectedEmployee.bank_name || selectedEmployee.bank_account) && (
                <div className="bg-[#94B4C1]/5 rounded-xl p-2.5">
                  <p className="text-[9px] font-black text-[#94B4C1] uppercase">Bank</p>
                  <p className="text-xs font-semibold text-[#213448]">{selectedEmployee.bank_name} - {selectedEmployee.bank_account}</p>
                  {selectedEmployee.bank_holder && <p className="text-xs text-[#547792] mt-0.5">{selectedEmployee.bank_holder}</p>}
                </div>
              )}

              {/* Salary Highlight */}
              <div className="bg-[#213448]/5 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-[#547792] uppercase">Gaji Pokok</p>
                  <p className="text-base font-black text-[#213448]">Rp {selectedEmployee.basic_salary.toLocaleString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-[#547792] uppercase">Masa Kerja</p>
                  <p className="text-xs font-bold text-[#547792]">{getYearsOfService(selectedEmployee.hire_date)}</p>
                </div>
              </div>
            </div>

            {/* NO FOOTER BUTTONS - Removed Tutup and Edit buttons */}
          </div>
        </div>
      )}
    </div>
  );
};

const CheckCircle2 = ({ size, className }: { size: number; className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default EmployeeManagement;