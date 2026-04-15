import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  CalendarDays, 
  Timer, 
  LogOut, 
  BarChart3,
  Menu,
  X 
} from 'lucide-react';
import { logout } from '../../../../services/helper/auth';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Data Karyawan', path: '/employees', icon: Users },
  { label: 'Data Absensi', path: '/attendance', icon: CalendarClock },
  { label: 'Pengajuan Cuti', path: '/leave', icon: CalendarDays },
  { label: 'Data Lembur', path: '/overtime', icon: Timer },
  { label: 'Laporan', path: '/reports', icon: BarChart3 },
];

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-3 left-4 z-[60] p-2 bg-[#213448] text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        h-screen w-[280px] shrink-0 bg-white text-slate-800 flex flex-col shadow-2xl border-r border-slate-100
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        <div className="px-8 py-10 flex justify-center">
          <img src="/logo.png" alt="HumaNest Logo" className="h-[70px] lg:h-[90px] w-auto object-contain" />
        </div>

        <nav className="flex-1 px-4 mt-2 overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center gap-4 rounded-xl px-5 py-3.5 text-sm font-bold transition-all
                      ${active
                        ? 'bg-[#213448] text-white shadow-lg shadow-[#213448]/20 scale-[1.02]'
                        : 'text-slate-500 hover:bg-[#94B4C1]/10 hover:text-[#213448]'}
                    `}
                  >
                    <Icon size={20} className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-[#547792]'}`} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-100 mb-2">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;