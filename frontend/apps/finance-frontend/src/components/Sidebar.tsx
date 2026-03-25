import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, FileText, BarChart3, LogOut } from 'lucide-react';
import { logout } from '../../../../services/helper/auth';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Payroll Management', path: '/payroll', icon: Wallet },
  { label: 'Laporan', path: '/reports', icon: BarChart3 },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="h-screen w-[260px] shrink-0 bg-white text-slate-800 flex flex-col shadow-xl z-20 border-r border-slate-200">
      {/* Branding / Logo Box (Besar seperti HR) */}
      <div className="px-8 py-12">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="HumaNest Logo" className="h-[100px] w-auto object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 mt-4">
        <ul className="space-y-2">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    group flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300
                    ${active
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-[1.02]'
                      : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}
                  `}
                >
                  <Icon
                    size={20}
                    className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'} transition-colors`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Account */}
      <div className="px-6 py-8 border-t border-slate-50">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;