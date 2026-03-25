import { CreditCard, UserCheck, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Payroll', val: 'Rp 1.2M', icon: CreditCard, color: 'emerald' },
    { label: 'Staff Paid', val: '124', icon: UserCheck, color: 'blue' },
    { label: 'Pending', val: '12', icon: Clock, color: 'amber' },
    { label: 'Issues', val: '0', icon: AlertCircle, color: 'rose' },
  ];

  return (
    <div className="space-y-10">
      {/* Header Dashboard */}
      <div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400 font-bold mt-1 uppercase text-xs tracking-[0.2em]">Payroll Management System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-14 h-14 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center mb-6`}>
              <item.icon size={26} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{item.val}</h3>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Recent Activity</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-6 py-4">Periode</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-6 font-black text-slate-700 uppercase">Februari 2026</td>
                <td className="px-6 py-6 font-bold text-slate-600 uppercase">Rp 450.000.000</td>
                <td className="px-6 py-6 text-center">
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase">Completed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;