import { useEffect, useState } from "react";
import apiClient from "../../../../services/api";
import { handleError } from "../../../../services/handler/error";
import { showSuccess, showError, showConfirm } from "../../../../services/helper/swal";
import { Plus, Search, Trash2, Eye, Edit, UserCog, X, ShieldCheck, Mail, User } from "lucide-react";

interface UserData {
  id_user: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const initialForm = {
    username: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    is_active: true
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/users");
      setUsers(res.data.data);
    } catch (e: any) {
      console.error(handleError(e));
    }
  };

  const handleDeleteSingle = async (id: number) => {
    const confirm = await showConfirm("Hapus user?", "Data user ini akan dihapus secara permanen.");
    if (!confirm.isConfirmed) return;

    try {
      await apiClient.delete(`/users/${id}`);
      showSuccess("Berhasil", "User telah dihapus");
      fetchUsers();
    } catch (e: any) {
      showError("Gagal", handleError(e));
    }
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      await apiClient.post("/users", form);
      showSuccess("Berhasil", "User baru telah dibuat");
      setShowCreate(false);
      setForm(initialForm);
      fetchUsers();
    } catch (e: any) {
      showError("Gagal", handleError(e));
    }
  };

  const handleEdit = async (e: any) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await apiClient.put(`/users/${selectedUser.id_user}`, form);
      showSuccess("Berhasil", "Data user diperbarui");
      setShowEdit(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (e: any) {
      showError("Gagal", handleError(e));
    }
  };

  const openEdit = (u: UserData) => {
    setSelectedUser(u);
    setForm({
      username: u.username,
      email: u.email,
      password: "",
      role: u.role,
      is_active: u.is_active
    });
    setShowEdit(true);
  };

  const openDetail = (u: UserData) => {
    setSelectedUser(u);
    setShowDetail(true);
  };

  const filtered = users.filter(u =>
    [u.username, u.email, u.role].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="bg-[#213448]/10 p-3 rounded-xl text-[#213448]">
            <UserCog size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#213448]">Manajemen User</h1>
            <p className="text-slate-500 text-sm">Kelola akses dan informasi pengguna sistem</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#213448] hover:bg-[#1a2a3a] text-white px-5 py-2.5 rounded-xl flex gap-2 items-center transition-all shadow-md shadow-slate-200 font-semibold"
          >
            <Plus size={18} />
            Tambah User
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative group">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#547792] transition-colors" />
        <input
          className="pl-12 pr-4 py-3.5 w-full bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#547792]/5 focus:border-[#547792] outline-none transition-all shadow-sm"
          placeholder="Cari berdasarkan nama, email, atau role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Username</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id_user} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#213448] font-bold text-xs border border-slate-200">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-700">{u.username}</span>
                    </div>
                  </td>
                  <td className="p-5 text-slate-600">{u.email}</td>
                  <td className="p-5">
                    <span className="px-3 py-1 rounded-lg bg-[#547792]/10 text-[#547792] text-xs font-bold border border-[#547792]/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${u.is_active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                      {u.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => openDetail(u)} className="p-2 text-slate-400 hover:text-[#547792] hover:bg-[#547792]/5 rounded-lg transition-all" title="Detail">
                        <Eye size={20} />
                      </button>
                      <button onClick={() => openEdit(u)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit">
                        <Edit size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSingle(u.id_user)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                        title="Hapus User"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL WRAPPER COMPONENT */}
      {(showDetail || showCreate || showEdit) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-[#213448]">
                {showDetail ? "Detail User" : showCreate ? "Tambah User Baru" : "Edit Informasi User"}
              </h2>
              <button 
                onClick={() => { setShowDetail(false); setShowCreate(false); setShowEdit(false); }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {showDetail && selectedUser && (
                <div className="space-y-4 text-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1 tracking-wider">Username</p>
                      <p className="font-semibold text-[#213448]">{selectedUser.username}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1 tracking-wider">Role</p>
                      <p className="font-semibold text-[#213448]">{selectedUser.role}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1 tracking-wider">Email</p>
                    <p className="font-semibold text-[#213448]">{selectedUser.email}</p>
                  </div>
                  <button onClick={() => setShowDetail(false)} className="w-full bg-[#213448] text-white py-3 rounded-2xl font-bold mt-4 hover:bg-[#1a2a3a] transition-colors">
                    Tutup
                  </button>
                </div>
              )}

              {(showCreate || showEdit) && (
                <form onSubmit={showCreate ? handleCreate : handleEdit} className="space-y-4">
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#547792]/5 focus:border-[#547792] outline-none transition-all"
                      placeholder="Username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-[#547792]/5 focus:border-[#547792] outline-none transition-all"
                      placeholder="Email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setShowCreate(false); setShowEdit(false); setForm(initialForm); }}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`flex-1 px-4 py-3 rounded-2xl font-bold text-white shadow-lg transition-all ${
                        showCreate ? 'bg-[#213448] hover:bg-[#1a2a3a]' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-100'
                      }`}
                    >
                      {showCreate ? "Simpan User" : "Update Data"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;