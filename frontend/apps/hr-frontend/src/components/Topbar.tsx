import { useEffect, useState } from 'react';
import { logout } from '../../../../services/helper/auth';
import { LogOut, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import { showToast } from '../../../../services/helper/swal';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:7000'); 

const Topbar = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    socket.on("newLeaveRequest", (data) => {
      setNotifications(prev => [data, ...prev]);
      showToast(data.message, 'info');
    });

    return () => {
      socket.off("newLeaveRequest");
    };
  }, []);

  return (
    <header className="h-16 bg-emerald-600 border-b border-emerald-700 flex items-center justify-between px-4 sm:px-8 shadow-md sticky top-0 z-30">
      
      {/* Kiri: Judul/Branding */}
      <div className="flex items-center gap-4">
        {/* Spacer untuk Hamburger di Mobile (agar tidak tertutup tombol menu sidebar) */}
        <div className="w-10 lg:hidden" /> 
        
        <div className="hidden sm:flex items-center text-white font-black text-xl tracking-tight">
          HumaNest
        </div>
      </div>

      {/* Kanan: Icons & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* --- Tombol Lonceng Notifikasi --- */}
        <div className="relative group">
          <button className="p-2 sm:p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all relative">
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-emerald-600 animate-pulse"></span>
            )}
          </button>

          {/* Dropdown Notif - Disesuaikan agar tidak keluar layar di mobile */}
          <div className="absolute right-[-50px] sm:right-0 mt-2 w-64 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 hidden group-hover:block animate-in fade-in zoom-in duration-200 z-50">
            <div className="flex items-center justify-between p-2 border-b border-slate-50 mb-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notifikasi Terbaru</p>
              {notifications.length > 0 && (
                 <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                   {notifications.length} Baru
                 </span>
              )}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-400 italic">Tidak ada notifikasi baru</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="p-3 text-sm text-slate-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer mb-1 border border-transparent hover:border-emerald-100">
                    {n.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* --- Profil / Account --- */}
        <Link 
          to="/account"
          className="flex items-center gap-2 sm:gap-3 pr-2 sm:pr-4 border-r border-emerald-500/50 hover:bg-white/5 p-1 rounded-xl transition-colors group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold border border-white/30 group-hover:border-white transition-all shadow-sm">
             <User size={18} />
          </div>
          <span className="hidden md:inline text-white text-sm font-bold tracking-wide"></span>
        </Link>

        {/* --- Logout --- */}
        <button
          onClick={logout}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-xs"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="hidden lg:inline uppercase tracking-widest"></span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;