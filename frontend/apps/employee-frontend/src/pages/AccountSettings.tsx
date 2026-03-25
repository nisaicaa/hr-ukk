import { useState, useEffect } from 'react';
import { getUser } from '../../../../services/helper/auth';
import { User, Mail, Save, ArrowLeft, Phone, Camera, Loader2, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../../services/api';
import { handleError } from '../../../../services/handler/error';
import { showSuccess, showToast } from '../../../../services/helper/swal';

const AccountSettingsEmployee = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  
  // State untuk data profil
  const [userData, setUserData] = useState<any>(null);
  // State untuk form edit (hanya field yang boleh diubah)
  const [formData, setFormData] = useState({
    phone_number: '', 
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [currentUser?.id_user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/users/${currentUser?.id_user}`);
      const data = res.data.data;
      setUserData(data);
      setFormData({
        phone_number: data.phone_number || '',
      });
      // Set preview gambar dari URL API
      if (data.profile_picture) {
        setPreviewUrl(`${import.meta.env.VITE_API_URL}/uploads/profiles/${data.profile_picture}`);
      }
    } catch (error) {
      showToast("Gagal memuat data profil", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk ganti foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      // Preview gambar lokal
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Menggunakan FormData karena ada file upload
      const data = new FormData();
      data.append('phone_number', formData.phone_number);
      if (profilePicture) {
        data.append('profile_picture', profilePicture);
      }

      // FUNGSI EDIT AKTIF
      await apiClient.put(`/users/${currentUser?.id_user}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showSuccess("Berhasil", "Profil berhasil diperbarui!");
      fetchUserData(); // Refresh data setelah update
    } catch (error) {
      showToast(handleError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <Loader2 className='animate-spin text-emerald-500' size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="font-black text-slate-800 text-xl">Pengaturan Profil</h1>
      </div>

      <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
        {/* Profile Card - BULAT & WARNA BARU */}
        <div className="bg-white rounded-[30px] p-8 md:p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
                {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-28 h-28 rounded-full object-cover shadow-lg" />
                ) : (
                    <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-200">
                        <span className="text-white text-5xl font-black">
                            {userData?.username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                
                {/* Tombol Kamera untuk Upload */}
                <label htmlFor="fileUpload" className="absolute bottom-1 right-1 p-2.5 bg-white text-slate-600 rounded-full cursor-pointer hover:bg-slate-100 transition-colors shadow-lg border border-slate-100">
                    <Camera size={18} />
                    <input type="file" id="fileUpload" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            </div>
            
            <div className='text-center md:text-left flex-grow'>
                <h3 className="text-2xl font-black text-slate-900">{userData?.username}</h3>
                <p className="text-slate-500 font-medium mb-3">{userData?.email}</p>
                <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black bg-purple-50 text-purple-600 border border-purple-100 uppercase tracking-widest">
                    {userData?.role || 'KARYAWAN'}
                </div>
            </div>
        </div>

        {/* Settings Form - Editable & Read-only */}
        <div className="bg-white rounded-[30px] p-8 md:p-10 shadow-sm border border-slate-100">
          <h2 className="text-xl font-black text-slate-900 mb-6">Edit Informasi Akun</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username Read-only */}
              <div>
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  <User size={14} /> Username (TIDAK BISA DIUBAH)
                </label>
                <input
                  type="text"
                  value={userData?.username || ''}
                  disabled
                  className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              {/* Email Read-only */}
              <div>
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  <Mail size={14} /> Email (TIDAK BISA DIUBAH)
                </label>
                <input
                  type="email"
                  value={userData?.email || ''}
                  disabled
                  className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              {/* Jabatan Read-only (Tambahan) */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  <Briefcase size={14} /> Posisi/Jabatan (TIDAK BISA DIUBAH)
                </label>
                <input
                  type="text"
                  value={userData?.employee?.jabatan || 'Belum diatur'}
                  disabled
                  className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              {/* Phone Number Editable */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                  <Phone size={14} /> No. Handphone
                </label>
                <input
                  type="text"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all font-medium text-slate-900"
                  placeholder="Contoh: 08123456789"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 disabled:bg-slate-400 transition-all shadow-lg"
              >
                {saving ? (
                    <> <Loader2 size={18} className='animate-spin' /> Menyimpan... </>
                ) : (
                    <> <Save size={18} /> Simpan Perubahan </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsEmployee;