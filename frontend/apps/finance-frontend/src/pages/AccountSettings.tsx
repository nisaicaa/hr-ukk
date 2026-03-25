import { useState } from 'react';
import { getUser } from '../../../../services/helper/auth';
import { Shield } from 'lucide-react';

const AccountSettings = () => {
  const currentUser = getUser();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profile Saya</h1>
        <p className="text-slate-500 mt-1 font-medium">Informasi akun {currentUser?.role} Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[30px] p-8 shadow-sm border border-slate-100">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-900 rounded-[25px] flex items-center justify-center shadow-lg shadow-slate-200">
                  <span className="text-white text-4xl font-black">
                    {currentUser?.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900">{currentUser?.username}</h3>
              <p className="text-sm text-slate-500 mb-6">{currentUser?.email}</p>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-widest">
                <Shield size={14} className="mr-2" />
                {currentUser?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Read-only Data (TIDAK BISA EDIT) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[30px] p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-black text-slate-900 mb-6">Informasi Akun (Read-only)</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Username</label>
                  <p className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-700">
                    {currentUser?.username}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
                  <p className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-semibold text-slate-700">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm font-medium">
                Profil hanya bisa diubah oleh Admin.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;