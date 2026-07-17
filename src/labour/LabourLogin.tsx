import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Briefcase, CheckCircle } from 'lucide-react';
import { useLabourAuth } from './LabourAuthContext';

const validateEmail = (email: string) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim());

export default function LabourLogin() {
  const { loginLabour } = useLabourAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim() || !validateEmail(email)) errs.email = 'Enter a valid email address.';
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/labour/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      setSuccess(true);
      setTimeout(() => loginLabour(data.token, data.labour), 600);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1410] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-[9px] uppercase tracking-[0.3em] font-sans font-bold text-[#6B9080] block mb-1">
            LABOUR PORTAL
          </span>
          <h1 className="text-5xl font-serif font-black text-[#FAF9F6] tracking-tighter">Nestly</h1>
          <p className="text-[#FAF9F6]/40 text-sm font-sans mt-2">Seller & Professional Dashboard</p>
        </div>

        <div className="bg-[#1A2118] border border-[#FAF9F6]/5 p-8">
          <h2 className="font-serif text-2xl font-black text-[#FAF9F6] mb-6">
            {success ? 'Welcome back!' : 'Sign In'}
          </h2>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <CheckCircle className="w-12 h-12 text-[#6B9080]" />
              <p className="text-[#FAF9F6]/70 font-sans text-sm">Loading your dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {serverError && (
                <div className="flex items-center gap-2 bg-red-900/20 text-red-400 text-xs p-3 border border-red-800/50">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#FAF9F6]/50 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAF9F6]/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                    placeholder="you@example.com"
                    className={`w-full pl-9 pr-4 py-3 bg-[#0F1410] border ${errors.email ? 'border-red-700' : 'border-[#FAF9F6]/10 focus:border-[#6B9080]'} outline-none text-sm font-sans text-[#FAF9F6] placeholder:text-[#FAF9F6]/20 transition-colors`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-[#FAF9F6]/50 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FAF9F6]/30" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-3 bg-[#0F1410] border ${errors.password ? 'border-red-700' : 'border-[#FAF9F6]/10 focus:border-[#6B9080]'} outline-none text-sm font-sans text-[#FAF9F6] placeholder:text-[#FAF9F6]/20 transition-colors`}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FAF9F6]/30 hover:text-[#FAF9F6]/60">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#6B9080] text-[#0F1410] font-sans font-bold text-[11px] uppercase tracking-widest py-3.5 hover:bg-[#7da89a] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              >
                {isLoading ? <div className="w-4 h-4 border-2 border-[#0F1410]/30 border-t-[#0F1410] rounded-full animate-spin" /> : 'Sign In to Dashboard'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-[#FAF9F6]/30 text-xs font-sans">
          Not a seller yet?{' '}
          <a href="/" className="text-[#6B9080] hover:text-[#7da89a] transition-colors font-bold">
            Apply on Nestly
          </a>
        </p>
      </div>
    </div>
  );
}
