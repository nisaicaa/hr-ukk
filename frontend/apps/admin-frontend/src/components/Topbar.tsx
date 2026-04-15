import { useEffect, useState } from 'react';
import { logout } from '../../../../services/helper/auth';
import { LogOut, User, } from 'lucide-react';
import { Link } from 'react-router-dom';
import { showToast } from '../../../../services/helper/swal';

// const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:7000'); 

const Topbar = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // socket.on("newLeaveRequest", (data) => {
    //   setNotifications(prev => [data, ...prev]);
    //   showToast(data.message, 'info');
    // });

    return () => {
      // socket.off("newLeaveRequest");
    };
  }, []);

  return (
    <header className="h-16 bg-[#547792] border-b border-[#213448]/10 flex items-center justify-between px-4 sm:px-8 shadow-md sticky top-0 z-30">
      
      {/* Kiri: Judul/Branding */}
      <div className="flex items-center gap-4">
        {/* Spacer untuk Hamburger di Mobile */}
        <div className="w-10 lg:hidden" /> 
        
        <div className="hidden sm:flex items-center text-white font-black text-xl tracking-tight">
          HumaNest
        </div>
      </div>

      {/* Kanan: Icons & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        
  

        {/* --- Icon User Saja (Card Profile & Garis Dihapus) --- */}
        <Link 
          to="/account"
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
        >
          <User size={20} />
        </Link>

        {/* --- Logout --- */}
        <button
          onClick={logout}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-xs"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;