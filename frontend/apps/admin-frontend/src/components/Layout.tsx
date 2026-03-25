import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex h-full max-w-6xl flex-col px-8 py-8 gap-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
