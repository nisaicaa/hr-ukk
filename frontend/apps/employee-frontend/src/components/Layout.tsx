import { Outlet, useNavigate } from "react-router-dom";
import { User, Bell, LogOut } from "lucide-react";
import { logout } from "../../../../services/helper/auth";

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-700">
      {/* HEADER */}
      <header className="h-20 bg-white flex items-center justify-between px-6 md:px-10 sticky top-0 z-50 shadow-sm border-b border-slate-100">
        <div className="flex items-center gap-4">
          {/* LOGO: Hanya bagian ini yang diperbesar (h-14 md:h-16) */}
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-14 md:h-16 w-auto object-contain transition-transform active:scale-95 cursor-pointer" 
            onClick={() => navigate('/dashboard')}
          />
        </div>
        
        {/* Bagian Kanan: Tetap sama (icon & tombol) */}
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => navigate('/account-settings')}
            className="p-2.5 text-[#213448] hover:bg-slate-50 rounded-2xl transition-all"
          >
            <User size={24} />
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-[#213448] hover:bg-slate-50 rounded-xl transition-all font-bold text-sm group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
            <span className="hidden md:block">Keluar</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto p-4 md:p-10 animate-in fade-in duration-500">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;