import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Camera, Loader2, Pencil, X, Save, ShieldCheck, Mail, User, Fingerprint, ChevronRight, Globe, Zap } from 'lucide-react';
import apiClient from '../../../../services/api';
import { handleError } from '../../../../services/handler/error';
import { showSuccess, showToast } from '../../../../services/helper/swal';

const AccountSettingsEmployee = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({ phone_number: '' });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { data } } = await apiClient.get('/employees/me');
      setUserData(data);
      setFormData({ phone_number: data.phone_number || '' });
      if (data.profile_picture) {
        setPreviewUrl(`${import.meta.env.VITE_API_URL}/uploads/profiles/${data.profile_picture}`);
      }
    } catch { showToast("Gagal memuat profil", "error"); }
    finally { setLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append('phone_number', formData.phone_number);
      if (profilePicture) form.append('profile_picture', profilePicture);

      await apiClient.put('/employees/me', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      showSuccess("Berhasil", "Profil diperbarui!");
      setIsEdit(false);
      fetchUserData();
    } catch (err) { showToast(handleError(err), "error"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center bg-white'>
      <div className="flex flex-col items-center">
        <Loader2 className='animate-spin text-[#213448]' size={32} strokeWidth={3} />
        <p className="mt-4 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">HumaNest OS</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans text-[#213448]">
      
      {/* NIKMATI NAVIGASI MINIMALIS */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-all border border-slate-100"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
            <h1 className="text-lg font-black tracking-tight">Profil Pengguna</h1>
          </div>
          
          {!isEdit && (
            <button 
              onClick={() => setIsEdit(true)} 
              className="px-6 py-2.5 bg-[#213448] text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-slate-200 transition-all active:scale-95 flex items-center gap-2"
            >
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* SISI KIRI: IDENTITAS VISUAL */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="relative group mx-auto lg:mx-0 w-max">
              <div className="w-56 h-56 rounded-[60px] overflow-hidden bg-slate-50 border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-transform group-hover:scale-[1.02] duration-500">
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover" alt="User" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                    <User size={80} className="text-slate-200" />
                  </div>
                )}
              </div>
              
              {isEdit && (
                <label className="absolute bottom-4 -right-2 p-4 bg-white text-[#213448] rounded-[24px] shadow-2xl cursor-pointer hover:bg-emerald-500 hover:text-white transition-all border border-slate-100 group">
                  <Camera size={20} />
                  <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Verified Employee</p>
              <h2 className="text-4xl font-black tracking-tighter leading-none">{userData?.user?.username}</h2>
              <p className="text-slate-400 font-medium">{userData?.user?.email}</p>
            </div>

            <div className="pt-8 grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[28px] hover:border-slate-300 transition-all cursor-default group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
                    <Fingerprint size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Employee ID</p>
                    <p className="text-sm font-bold tracking-tight">{userData?.nik || 'NH-09228'}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-200" />
              </div>

              <div className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[28px] hover:border-slate-300 transition-all cursor-default group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Struktural</p>
                    <p className="text-sm font-bold tracking-tight">{userData?.jabatan}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-200" />
              </div>
            </div>
          </div>

          {/* SISI KANAN: FORM MINIMALIS */}
          <div className="lg:col-span-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
            <form onSubmit={handleSubmit} className="space-y-12">
              
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  <h3 className="font-black text-lg tracking-tight">Informasi Dasar</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  {/* INPUT CUSTOM STYLE */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Pengguna</label>
                    <input 
                      disabled 
                      value={userData?.user?.username} 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-400 cursor-not-allowed" 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Posisi / Role</label>
                    <input 
                      disabled 
                      value={userData?.jabatan} 
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-400 cursor-not-allowed" 
                    />
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      Nomor Telepon {isEdit && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    </label>
                    <div className="relative group">
                      <Phone className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${isEdit ? 'text-[#213448]' : 'text-slate-300'}`} size={18} />
                      <input 
                        disabled={!isEdit}
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        placeholder="08xx xxxx xxxx"
                        className={`w-full pl-16 pr-6 py-5 rounded-[24px] font-black text-lg transition-all border-2 
                          ${isEdit 
                            ? 'bg-white border-[#213448] shadow-[0_10px_30px_rgba(33,52,72,0.08)]' 
                            : 'bg-white border-slate-100 text-slate-400'}`} 
                      />
                    </div>
                  </div>
                </div>
              </section>

              {isEdit ? (
                <div className="flex flex-col sm:flex-row gap-4 animate-in zoom-in-95 duration-300">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-[2] bg-[#213448] text-white py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-slate-200"
                  >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Simpan Perubahan</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEdit(false)}
                    className="flex-1 bg-slate-50 text-slate-500 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-2"
                  >
                    <X size={18} /> Batalkan
                  </button>
                </div>
              ) : (
                <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100/50 flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                    <ShieldCheck className="text-emerald-500" size={28} />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-black text-sm tracking-tight">Keamanan Akun Terjamin</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">Data sensitif Anda dienkripsi secara end-to-end oleh sistem HumaNest.</p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountSettingsEmployee;