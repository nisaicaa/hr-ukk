import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  LogOut, 
  ClipboardList, 
  Menu, 
  X 
} from 'lucide-react'
import { logout } from '../../../../services/helper/auth'

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Manajemen Pengguna', path: '/users', icon: Users },
  { label: 'Log Aktivitas', path: '/logs', icon: ClipboardList },
  { label: 'Laporan', path: '/reports', icon: BarChart3 },
]

const Sidebar = () => {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Tombol Hamburger Mobile - Navy Style */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-3 left-4 z-[60] p-2.5 bg-[#213448] text-white rounded-xl shadow-lg hover:bg-[#547792] transition-colors"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        h-screen w-[260px] shrink-0 bg-white text-slate-800 flex flex-col shadow-2xl border-r border-slate-100
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Branding */}
        <div className="px-8 py-12">
          <div className="flex flex-col items-center">
            <img src="/logo.png" alt="HumaNest Logo" className="h-[90px] lg:h-[100px] w-auto object-contain" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 mt-2 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(item => {
              const active = location.pathname === item.path
              const Icon = item.icon

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300
                      ${active
                        ? 'bg-[#213448] text-white shadow-lg shadow-slate-200 scale-[1.02]'
                        : 'text-slate-500 hover:bg-[#94B4C1]/10 hover:text-[#547792]'}
                    `}
                  >
                    <Icon
                      size={20}
                      className={`${active ? 'text-[#94B4C1]' : 'text-slate-400 group-hover:text-[#547792]'} transition-colors`}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div className="px-6 py-8 border-t border-slate-100">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar;