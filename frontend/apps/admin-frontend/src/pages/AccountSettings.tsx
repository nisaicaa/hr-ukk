import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../../services/helper/auth";
import apiClient from "../../../../services/api";
import { showSuccess, showToast } from "../../../../services/helper/swal";
import { User, Mail, Lock, Save, Loader2, Shield, ArrowLeft } from "lucide-react";

const AccountSettings = () => {
  const currentUser = getUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    password: ""
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/users/${currentUser.id_user}`, formData);
      showSuccess("Berhasil", "Profil diperbarui");
    } catch (err) {
      showToast("Gagal update profil", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-500">
      
      {/* HEADER & BACK BUTTON - Dibuat Minimalis */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm group"
        >
          <ArrowLeft size={20} className="text-slate-600 group-hover:-translate-x-1 transition-transform" />
        </button>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pengaturan Akun</h1>
      </div>

      {/* MAIN CONTAINER: Satu Wadah Besar untuk Semua Informasi */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          
          {/* SISI KIRI: Area Profil (Background Biru Muda Halus) */}
          <div className="lg:w-1/3 bg-slate-50/50 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="relative mb-6">
              {/* Avatar Polos */}
              <div className="w-32 h-32 bg-white rounded-[30px] flex items-center justify-center border-4 border-white shadow-xl shadow-slate-200/50 overflow-hidden group">
                <User size={64} className="text-slate-200 group-hover:scale-110 transition-transform duration-500" />
              </div>
              {/* Badge Status Online */}
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm"></div>
            </div>

            <div className="text-center space-y-1 mb-6">
              <h3 className="text-xl font-black text-slate-900">{currentUser?.username}</h3>
              <p className="text-sm text-slate-500 font-medium">{currentUser?.email}</p>
            </div>

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</span>
                <span className="flex items-center text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                  <Shield size={12} className="mr-1.5" />
                  {currentUser?.role}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-600">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 Akun Terverifikasi
              </div>
            </div>
          </div>

          {/* SISI KANAN: Form Pengisian */}
          <div className="lg:w-2/3 p-8 md:p-12">
            <div className="mb-8">
              <h2 className="text-xl font-black text-slate-900">Perbarui Informasi</h2>
              <p className="text-sm text-slate-400 font-medium">Pastikan data Anda tetap akurat.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* USERNAME */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Password (Opsional)</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Masukkan password baru"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">*Kosongkan jika tidak ingin mengubah password.</p>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-sm transition-all duration-300 shadow-xl shadow-slate-200 active:scale-95 disabled:bg-slate-300"
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="text-blue-400" />}
                  SIMPAN PERUBAHAN
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;