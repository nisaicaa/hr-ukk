import { useState, useEffect } from 'react';
import { getUser } from '../../../../services/helper/auth';
import { User, Mail, Save, ArrowLeft, Phone, Camera, Loader2, Briefcase, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../../services/api';
import { handleError } from '../../../../services/handler/error';
import { showSuccess, showToast } from '../../../../services/helper/swal';

const AccountSettingsEmployee = () => {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    phone_number: '',
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/employees/me');
      const data = res.data.data;

      setUserData(data);
      setFormData({
        phone_number: data.phone_number || '',
      });

      // ✅ PASTIKAN URL INI BENAR (SESUAI KODE ASLI ANDA)
      if (data.profile_picture) {
        setPreviewUrl(`${import.meta.env.VITE_API_URL}/uploads/profiles/${data.profile_picture}`);
      }

    } catch (error) {
      showToast("Gagal memuat profil", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: any) => {
    if (!isEdit) return;
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file)); // Preview foto saat pilih file
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);

    try {
      const form = new FormData();
      form.append('phone_number', formData.phone_number);
      if (profilePicture) {
        form.append('profile_picture', profilePicture);
      }

      await apiClient.put('/employees/me', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showSuccess("Berhasil", "Profil berhasil diperbarui!");
      setIsEdit(false);
      fetchUserData();
    } catch (error) {
      showToast(handleError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <Loader2 className='animate-spin text-emerald-500' size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in duration-700">
      
      {/* HEADER NAVIGATION */}
      <div className="flex items-center gap-4 mt-6">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan Profil</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* PROFILE CARD */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm flex flex-col items-center text-center">
            
            <div className="relative">
              {/* CONTAINER FOTO - Menggunakan overflow-hidden agar gambar tidak keluar jalur */}
              <div className="w-32 h-32 rounded-[35px] border-[6px] border-slate-50 shadow-inner overflow-hidden bg-slate-100 flex items-center justify-center">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                    onError={(e) => {
                       // Jika URL gambar error (404), tampilkan inisial
                       e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-4xl font-bold text-slate-300">
                    {userData?.user?.username?.[0]}
                  </div>
                )}
              </div>

              {/* INPUT FILE OVERLAY */}
              {isEdit && (
                <label className="absolute -bottom-2 -right-2 p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-emerald-700 transition-all active:scale-90">
                  <Camera size={18} />
                  <input type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                </label>
              )}
            </div>

            <div className="mt-6">
              <h2 className="font-bold text-xl text-slate-800">{userData?.user?.username}</h2>
              <p className="text-emerald-600 font-bold text-sm uppercase mt-1">{userData?.jabatan}</p>
              <p className="text-slate-400 text-sm mt-2">{userData?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* FORM DATA */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-[50px] p-10 shadow-sm space-y-8">
            
            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
              <h2 className="text-lg font-bold text-slate-800">Informasi Pribadi</h2>
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => setIsEdit(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-100 active:scale-95 transition-all"
                >
                  <Pencil size={16} /> Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username (Read Only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                <input
                  value={userData?.user?.username || ''}
                  disabled
                  className="w-full p-4 bg-slate-50 border-none rounded-3xl text-slate-500 font-medium"
                />
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input
                  value={userData?.user?.email || ''}
                  disabled
                  className="w-full p-4 bg-slate-50 border-none rounded-3xl text-slate-500 font-medium"
                />
              </div>

              {/* Jabatan (Read Only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Jabatan</label>
                <input
                  value={userData?.jabatan || ''}
                  disabled
                  className="w-full p-4 bg-slate-50 border-none rounded-3xl text-slate-500 font-medium"
                />
              </div>

              {/* Phone (Editable) */}
              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${isEdit ? 'text-emerald-600' : 'text-slate-400'}`}>No Handphone</label>
                <div className="relative">
                   <Phone size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isEdit ? 'text-emerald-500' : 'text-slate-300'}`} />
                   <input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ phone_number: e.target.value })}
                    disabled={!isEdit}
                    placeholder="Masukkan No HP"
                    className={`w-full pl-12 pr-4 py-4 rounded-3xl font-bold transition-all
                      ${isEdit ? 'bg-white border-2 border-emerald-100 ring-4 ring-emerald-50/50' : 'bg-slate-50 border-none text-slate-600'}`}
                  />
                </div>
              </div>
            </div>

            {isEdit && (
              <div className="flex gap-4 pt-4 animate-in slide-in-from-bottom-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-[25px] font-bold text-lg shadow-xl shadow-emerald-100 active:scale-95 transition-all"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEdit(false);
                    // Reset preview ke foto lama jika batal
                    setPreviewUrl(userData?.profile_picture ? `${import.meta.env.VITE_API_URL}/uploads/profiles/${userData.profile_picture}` : '');
                  }}
                  className="px-8 py-4 bg-slate-100 text-slate-500 rounded-[25px] font-bold active:scale-95 transition-all"
                >
                  Batal
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsEmployee;