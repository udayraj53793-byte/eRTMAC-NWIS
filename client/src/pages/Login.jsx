import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const redirectMap = { ADMIN: '/admin/dashboard', MANAGER: '/manager/dashboard', ENGINEER: '/engineer/dashboard' };
      navigate(redirectMap[user.role] || '/engineer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = {
      ENGINEER: ['engineer@ertmac.demo', 'Demo@2024'],
      MANAGER: ['manager@ertmac.demo', 'Demo@2024'],
      ADMIN: ['admin@ertmac.demo', 'Demo@2024'],
    };
    const [e, p] = creds[role];
    setEmail(e); setPassword(p);
  };

  return (
    <main className="login-screen min-h-screen p-4 sm:p-8">
      <div className="login-layout mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="login-intro relative flex min-h-64 flex-col justify-between overflow-hidden p-7 text-white sm:p-10 lg:min-h-[44rem]">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="login-mark flex h-11 w-11 items-center justify-center rounded-xl">
                <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current" aria-hidden="true">
                  <circle cx="16" cy="8" r="5" />
                  <path d="M14 13 L14 28 L18 28 L18 13 Z" />
                  <path d="M10 18 L22 18" strokeWidth="2" stroke="currentColor" fill="none" />
                  <path d="M10 22 L22 22" strokeWidth="2" stroke="currentColor" fill="none" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-bold tracking-wide">eRTMAC-NWIS</div>
                <div className="text-[11px] text-white/65">Nearby Wells Intelligence</div>
              </div>
            </div>
          </div>
          <div className="login-illustration absolute inset-x-0 bottom-24 top-24 hidden items-center justify-center lg:flex" aria-hidden="true">
            <svg viewBox="0 0 400 350" className="h-full max-h-80 w-full max-w-md">
              <defs>
                <linearGradient id="rigGold" x1="0" x2="1">
                  <stop offset="0%" stopColor="#dfa914" />
                  <stop offset="100%" stopColor="#f6d36a" />
                </linearGradient>
              </defs>
              <path d="M0 282h400" stroke="#6f8798" strokeWidth="2" />
              <path d="M70 282 152 65h36l85 217M95 215h155M112 168h120M130 120h83M145 83h52" fill="none" stroke="url(#rigGold)" strokeWidth="5" strokeLinecap="round" />
              <path d="M164 65v217M178 65v217" stroke="#c5d4de" strokeWidth="2" strokeDasharray="5 6" />
              <path d="M250 282h90M266 268v14M290 257v25M314 268v14" stroke="#83b88f" strokeWidth="4" strokeLinecap="round" />
              <circle cx="110" cy="282" r="7" fill="#dfa914" />
              <circle cx="290" cy="257" r="7" fill="#57a36a" />
              <path d="M60 310h280M91 325h220" stroke="#607889" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="relative z-10 max-w-md py-10 lg:py-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Engineering intelligence
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Experience that guides the next well.</h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              Operational context, verified history, and clear risk indicators—together in one decision-support workspace.
            </p>
          </div>
          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-[11px] text-white/55">
            <span>Oil India Limited</span>
            <span>Decision support platform</span>
          </div>
        </aside>

        <section className="flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700">Secure workspace access</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Sign in with your account or choose a demo role.</p>
            </div>

          {error && (
            <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="mb-2 block text-xs font-semibold text-slate-700">Email address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-2 block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} aria-label={showPwd ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-md disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-7 border-t border-slate-100 pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Demo role access
            </p>
            <p className="mb-3 mt-1 text-[11px] text-slate-500">
              Select a role to fill the sign-in form.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'ENGINEER', email: 'engineer@ertmac.demo' },
                { role: 'MANAGER', email: 'manager@ertmac.demo' },
                { role: 'ADMIN', email: 'admin@ertmac.demo' },
              ].map(({ role, email: roleEmail }) => {
                const isSelected = email === roleEmail;
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => fillDemo(role)}
                    className={`rounded-xl border px-2 py-2.5 text-[10px] font-bold tracking-wide transition-all sm:text-xs ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    {isSelected ? `✓ ${role}` : role}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500">Demo password: <span className="font-mono font-semibold text-slate-700">Demo@2024</span></p>
          </div>

        <p className="mt-7 text-center text-xs leading-relaxed text-slate-400">
          "Turning Historical Drilling Experience into Proactive Intelligence"
        </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Login;
