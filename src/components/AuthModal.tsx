import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Phone, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

const validateEmail = (email: string) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim());

const validatePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-400' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-400' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-400' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
};

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();

  const resetForm = () => {
    setEmail(''); setPassword(''); setFullName(''); setPhone('');
    setFieldErrors({}); setServerError(''); setSuccess(false); setShowPassword(false);
  };

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    resetForm();
  };

  const validateRegister = (): boolean => {
    const errors: FieldErrors = {};

    if (!fullName.trim() || fullName.trim().length < 3) {
      errors.fullName = 'Enter your full name (min. 3 characters).';
    } else if (!/^[a-zA-Z\s'-]+$/.test(fullName.trim())) {
      errors.fullName = 'Name can only contain letters and spaces.';
    } else if (fullName.trim().split(/\s+/).length < 2) {
      errors.fullName = 'Please enter your first and last name.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!validatePhone(phone)) {
      errors.phone = 'Enter a valid phone number (10–15 digits).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain at least one number.';
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      errors.password = 'Password must contain at least one special character (!@#$...).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLogin = (): boolean => {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    const isValid = activeTab === 'register' ? validateRegister() : validateLogin();
    if (!isValid) return;

    setIsLoading(true);

    const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = activeTab === 'login'
      ? { email: email.trim(), password }
      : { fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please try again.');
      }

      setSuccess(true);
      setTimeout(() => {
        login(data.token, data.user);
        onClose();
        resetForm();
      }, 800);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const pwStrength = activeTab === 'register' && password ? getPasswordStrength(password) : null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-[#FAF9F6] border border-[#1A1A1A]/10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-[#1A1A1A]/10 bg-white">
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#1A1A1A]/50 block mb-0.5">
                SECURE CUSTOMER PORTAL
              </span>
              <h2 className="font-serif text-2xl font-black text-[#1A1A1A]">
                {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A]/5 transition-colors rounded-sm">
              <X className="w-5 h-5 text-[#1A1A1A]/50" />
            </button>
          </div>

          <div className="p-6">
            {/* Tabs */}
            <div className="flex mb-5 border-b border-[#1A1A1A]/10">
              {(['login', 'register'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchTab(tab)}
                  className={`flex-1 pb-3 text-[11px] font-sans font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab
                      ? 'border-b-2 border-[#1C2B24] text-[#1C2B24]'
                      : 'text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70'
                  }`}
                >
                  {tab === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            {/* Success state */}
            {success && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
                <p className="font-serif text-xl font-bold text-[#1A1A1A]">
                  {activeTab === 'login' ? 'Signed in!' : 'Account created!'}
                </p>
                <p className="text-xs text-[#1A1A1A]/60 font-sans">Redirecting you now…</p>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Server error */}
                {serverError && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs p-3 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* Register fields */}
                {activeTab === 'register' && (
                  <>
                    <Field
                      label="Full Name"
                      icon={<UserIcon className="w-4 h-4" />}
                      error={fieldErrors.fullName}
                    >
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => { setFullName(e.target.value); setFieldErrors(p => ({ ...p, fullName: undefined })); }}
                        placeholder="Jane Doe"
                        className={inputClass(!!fieldErrors.fullName)}
                        autoComplete="name"
                      />
                    </Field>

                    <Field
                      label="Phone Number"
                      icon={<Phone className="w-4 h-4" />}
                      error={fieldErrors.phone}
                    >
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => { setPhone(e.target.value); setFieldErrors(p => ({ ...p, phone: undefined })); }}
                        placeholder="(555) 123-4567"
                        className={inputClass(!!fieldErrors.phone)}
                        autoComplete="tel"
                      />
                    </Field>
                  </>
                )}

                <Field
                  label="Email Address"
                  icon={<Mail className="w-4 h-4" />}
                  error={fieldErrors.email}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: undefined })); }}
                    placeholder="jane@example.com"
                    className={inputClass(!!fieldErrors.email)}
                    autoComplete="email"
                  />
                </Field>

                <Field
                  label="Password"
                  icon={<Lock className="w-4 h-4" />}
                  error={fieldErrors.password}
                  suffix={
                    <button type="button" onClick={() => setShowPassword(p => !p)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })); }}
                    placeholder="••••••••"
                    className={inputClass(!!fieldErrors.password)}
                    autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                  />
                </Field>

                {/* Password strength */}
                {pwStrength && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 transition-all duration-300 ${i <= pwStrength.score ? pwStrength.color : 'bg-[#1A1A1A]/10'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-[10px] font-sans font-bold uppercase tracking-wider ${
                      pwStrength.score <= 1 ? 'text-red-500' :
                      pwStrength.score <= 2 ? 'text-amber-500' :
                      pwStrength.score <= 3 ? 'text-yellow-600' : 'text-emerald-600'
                    }`}>
                      {pwStrength.label} password
                    </p>
                  </div>
                )}

                {activeTab === 'register' && (
                  <p className="text-[10px] text-[#1A1A1A]/50 font-sans leading-relaxed">
                    Password must be 8+ chars with uppercase, number, and special character.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#1C2B24] text-[#FAF9F6] font-sans font-bold text-[11px] uppercase tracking-widest py-3.5 mt-1 hover:bg-[#2a3d30] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-[#FAF9F6]/30 border-t-[#FAF9F6] rounded-full animate-spin" />
                  ) : (
                    <span>{activeTab === 'login' ? 'Sign In Securely' : 'Create My Account'}</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Helper components ─────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
  return `w-full pl-9 pr-4 py-2.5 bg-white border ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-[#1A1A1A]/20 focus:border-[#1C2B24]'
  } focus:ring-1 ${hasError ? 'focus:ring-red-300' : 'focus:ring-[#1C2B24]/30'} outline-none text-sm font-sans transition-all`;
}

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, icon, error, suffix, children }: FieldProps) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/60 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40">{icon}</span>
        {children}
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-[11px] text-red-600 font-sans flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
