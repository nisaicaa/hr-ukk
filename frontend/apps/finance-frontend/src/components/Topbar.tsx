import { logout } from '../../../../services/helper/auth';
import { LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Topbar = () => {
  return (
    <div className="h-16 bg-emerald-600 border-b border-emerald-700 flex items-center justify-between px-8 shadow-md shrink-0 z-50">
      {/* Branding */}
      <div className="flex items-center text-white font-black text-xl tracking-tight">
        HumaNest
      </div>

      <div className="flex items-center gap-4">
        {/* Account Link - Ghost Style */}
        <Link 
          to="/account"
          className="flex items-center gap-3 pr-4 border-r border-emerald-500/50 hover:bg-white/5 p-1 rounded-xl transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold border border-white/30 group-hover:border-white transition-all shadow-sm">
             <User size={18} />
          </div>
        </Link>

        {/* Logout Button */}
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