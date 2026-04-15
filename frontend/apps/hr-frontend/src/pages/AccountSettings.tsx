import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../../services/helper/auth";
import apiClient from "../../../../services/api";
import { showSuccess, showToast } from "../../../../services/helper/swal";
import { User, Mail, Lock, Save, Loader2, Shield, ArrowLeft, Camera } from "lucide-react";

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
      console.error(err);
      showToast("Gagal update profil", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* TOP NAVIGATION */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-[#547792] transition-all active:scale-90"
          >
            <ArrowLeft size={22} className="text-slate-400 group-hover:text-[#547792] transition-colors" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-[#213448] tracking-tight">Account <span className="text-[#547792]">Settings</span></h1>
            <p className="text-slate-400 text-sm font-medium">Manage your professional identity and security.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: VISUAL PROFILE CARD */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center text-center relative overflow-hidden">
            {/* Decorative Background Blob */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#547792]/10 to-transparent"></div>
            
            <div className="relative z-10">
              <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center border-8 border-white shadow-2xl shadow-[#213448]/10 overflow-hidden mb-6 group cursor-pointer">
                <User size={60} className="text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#213448]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-[#213448] leading-none">{currentUser?.username}</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#547792]/10 text-[#547792] rounded-full text-[10px] font-black uppercase tracking-widest mt-2">
                  <Shield size={12} />
                  {currentUser?.role}
                </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 mt-10 z-10">
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Status</p>
                <p className="text-xs font-bold text-emerald-600">Verified</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Security</p>
                <p className="text-xs font-bold text-[#547792]">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FORM DATA */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-xl shadow-slate-200/40">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* SECTION: BASIC INFO */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-1 bg-[#547792] rounded-full"></div>
                  <h3 className="text-lg font-black text-[#213448] tracking-tight uppercase text-sm">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Username</label>
                    <div className="group relative">
                      <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#547792] transition-colors" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] font-bold text-[#213448] focus:bg-white focus:border-[#547792] focus:ring-4 focus:ring-[#547792]/5 outline-none transition-all"
                        placeholder="Enter username"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="group relative">
                      <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#547792] transition-colors" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] font-bold text-[#213448] focus:bg-white focus:border-[#547792] focus:ring-4 focus:ring-[#547792]/5 outline-none transition-all"
                        placeholder="Enter email"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: SECURITY */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-1 bg-[#213448] rounded-full"></div>
                  <h3 className="text-lg font-black text-[#213448] tracking-tight uppercase text-sm">Security & Password</h3>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="group relative">
                    <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#547792] transition-colors" />
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] font-bold text-[#213448] focus:bg-white focus:border-[#547792] focus:ring-4 focus:ring-[#547792]/5 outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-4 py-6 bg-[#213448] hover:bg-[#547792] text-white rounded-[26px] font-black text-sm tracking-widest transition-all duration-500 shadow-2xl shadow-[#213448]/20 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  {saving ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      UPDATE ACCOUNT PROFILE
                    </>
                  )}
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