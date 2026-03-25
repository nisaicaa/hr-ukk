import { Outlet, useNavigate, useLocation } from "react-router-dom";
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
      <header className="h-20 bg-emerald-600 flex items-center justify-between px-10 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          {/* LOGO DIPERBESAR */}
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-12 md:h-14 w-auto object-contain brightness-0 invert transition-transform active:scale-95 cursor-pointer" 
            onClick={() => navigate('/dashboard')}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all relative">
            <Bell size={22} />
            <span className="absolute top-3 right-3 w-2 h-2 bg-amber-400 rounded-full border-2 border-emerald-600"></span>
          </button>
          
          <button 
            onClick={() => navigate('/account-settings')}
            className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
          >
            <User size={24} />
          </button>

          <div className="h-6 w-[1px] bg-white/20 mx-2"></div>

          {/* LOGOUT BUTTON - CLEAN STYLE */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white hover:bg-rose-500/20 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            <span className="hidden md:block"></span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;