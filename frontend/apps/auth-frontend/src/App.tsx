import { useState, FormEvent } from 'react';
import { API_BASE_URL } from '../../../services/constant';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

interface LoginResponse {
  token: string;
  user: {
    id_user: number;
    username: string;
    email: string;
    role: 'ADMIN' | 'HR' | 'FINANCE' | 'EMPLOYEE';
  };
  message?: string;
}

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email atau password salah');
      }

      // We still set them here for the login app state if needed
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const portMap = {
        ADMIN: '3011',
        HR: '3012',
        FINANCE: '3013',
        EMPLOYEE: '3014'
      };
      
      const targetPort = portMap[data.user.role] || '3011';
      
      // CRITICAL: Pass token and user via query params to cross the port boundary
      const userParam = encodeURIComponent(JSON.stringify(data.user));
      window.location.href = `http://localhost:${targetPort}/dashboard?token=${data.token}&user=${userParam}`;

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
          
          {/* Top Section - Smaller Height */}
          <div className="bg-emerald-600 px-8 py-10 text-center relative overflow-hidden">
            {/* Abstract Background patterns */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500 rounded-full -ml-10 -mb-10 blur-xl opacity-50"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              {/* Larger Logo */}
              <img src="/logo.png" alt="Logo" className="h-[120px] w-auto brightness-0 invert object-contain transition-transform hover:scale-105 duration-300" />
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="p-10 space-y-6">
            <div className="text-center mb-2">
               <h2 className="text-xl font-bold text-slate-900">Silakan masuk ke akun Anda</h2>
               <p className="text-xs text-slate-400 font-medium">Masuk untuk mengelola data Anda</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl flex items-center gap-3 text-[13px] font-bold animate-shake">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                  placeholder=""
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  MEMPROSES...
                </>
              ) : (
                'MASUK'
              )}
            </button>
          </form>
          
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-[10px] font-black text-slate-400 tracking-[0.2em]">2026 humanet</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
