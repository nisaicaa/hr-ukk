import { logout } from '../../../../services/helper/auth';
import { LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Topbar = () => {
  return (
    <header className="h-16 bg-emerald-600 border-b border-emerald-700 flex items-center justify-between px-4 sm:px-8 shadow-md shrink-0 z-40 sticky top-0">
      {/* Branding - Hidden on mobile to give space for hamburger */}
      <div className="flex items-center">
        <div className="w-12 lg:hidden" /> {/* Spacer untuk tombol hamburger */}
        <div className="hidden sm:block text-white font-black text-xl tracking-tight">
          HumaNest 
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Account Link */}
        <Link 
          to="/account"
          className="flex items-center gap-3 pr-2 sm:pr-4 border-r border-emerald-500/50 hover:bg-white/5 p-1 rounded-xl transition-colors group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold border border-white/30 group-hover:border-white transition-all shadow-sm">
             <User size={18} />
          </div>
          <span className="hidden md:inline text-white text-xs font-bold"></span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 font-bold text-xs"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="hidden lg:inline"></span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;