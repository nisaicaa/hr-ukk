// Topbar.tsx (Frontend HR)
import { useEffect, useState } from 'react';
import { logout } from '../../../../services/helper/auth';
import { LogOut, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client'; // 1. Import
import { showToast } from '../../../../services/helper/swal';

// 2. Koneksi ke socket server
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:7000'); 

const Topbar = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // 3. Dengar event pengajuan baru
    socket.on("newLeaveRequest", (data) => {
      setNotifications(prev => [data, ...prev]);
      showToast(data.message, 'info'); // Munculkan pop-up
    });

    return () => {
      socket.off("newLeaveRequest");
    };
  }, []);

  return (
    <div className="h-16 bg-emerald-600 border-b border-emerald-700 flex items-center justify-between px-8 shadow-md">
      <div className="flex items-center text-white font-black text-xl tracking-tight">
        HumaNest
      </div>
      <div className="flex items-center gap-4">
        {/* --- Tombol Lonceng Notifikasi --- */}
        <div className="relative group">
            <button className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all relative">
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-emerald-600 animate-pulse"></span>
                )}
            </button>
            {/* Dropdown Notif sederhana */}
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 hidden group-hover:block z-50">
                <p className="text-xs font-bold text-slate-400 p-2">Notifikasi Terbaru</p>
                {notifications.length === 0 && <p className="text-sm text-slate-500 p-2">Tidak ada notifikasi</p>}
                {notifications.map((n, i) => (
                    <div key={i} className="p-3 text-sm text-slate-700 hover:bg-slate-50 rounded-xl">
                        {n.message}
                    </div>
                ))}
            </div>
        </div>

        <Link 
          to="/account"
          className="flex items-center gap-3 pr-4 border-r border-emerald-500/50 hover:bg-white/5 p-1 rounded-xl transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold border border-white/30 group-hover:border-white transition-all shadow-sm">
             <User size={18} />
          </div>
        </Link>
        <button
          onClick={logout}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 font-bold text-xs"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline"></span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;