import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Phone, Briefcase, Languages, FileText, CheckCircle, AlertCircle, ChevronRight, ChevronLeft, Lock, Eye, EyeOff } from 'lucide-react';

interface SellerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPECIALTY_OPTIONS = [
  'Plumbing Repair', 'General Handyman', 'Electrical Fixes',
  'Deep Cleaning', 'Yard Care', 'Fixtures', 'TV Mounting',
  'Painting', 'Carpentry', 'HVAC', 'Pest Control', 'Moving Services',
];

const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'Arabic', 'Mandarin', 'Russian', 'Portuguese', 'Hindi'];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  specialties: string[];
  experienceYears: string;
  languages: string[];
  bio: string;
}

interface FieldErrors {
  [key: string]: string;
}

const validateEmail = (email: string) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.trim());

export default function SellerApplicationModal({ isOpen, onClose }: SellerApplicationModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState<FormData>({
    fullName: '', email: '', phone: '', password: '',
    specialties: [], experienceYears: '', languages: ['English'], bio: '',
  });

  const updateField = (field: keyof FormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleSpecialty = (s: string) => {
    setForm(prev => ({
      ...prev,
      specialties: prev.specialties.includes(s)
        ? prev.specialties.filter(x => x !== s)
        : [...prev.specialties, s],
    }));
  };

  const toggleLanguage = (l: string) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(l)
        ? prev.languages.filter(x => x !== l)
        : [...prev.languages, l],
    }));
  };

  const validateStep1 = () => {
    const errors: FieldErrors = {};
    if (!form.fullName.trim() || form.fullName.trim().split(/\s+/).length < 2)
      errors.fullName = 'Enter your first and last name.';
    else if (!/^[a-zA-Z\s'-]+$/.test(form.fullName))
      errors.fullName = 'Name can only contain letters and spaces.';
    if (!validateEmail(form.email))
      errors.email = 'Enter a valid email address.';
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10)
      errors.phone = 'Enter a valid phone number (min. 10 digits).';
    if (!form.password || form.password.length < 8)
      errors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(form.password))
      errors.password = 'Include at least one uppercase letter.';
    else if (!/[0-9]/.test(form.password))
      errors.password = 'Include at least one number.';
    else if (!/[^A-Za-z0-9]/.test(form.password))
      errors.password = 'Include at least one special character.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: FieldErrors = {};
    if (form.specialties.length === 0)
      errors.specialties = 'Select at least one specialty.';
    if (!form.experienceYears || isNaN(Number(form.experienceYears)) || Number(form.experienceYears) < 0)
      errors.experienceYears = 'Enter your years of experience.';
    if (form.languages.length === 0)
      errors.languages = 'Select at least one language.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: FieldErrors = {};
    if (!form.bio.trim() || form.bio.trim().length < 30)
      errors.bio = 'Please write at least 30 characters about yourself.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setIsLoading(true);
    setServerError('');

    try {
      const res = await fetch('/api/labour/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, experienceYears: Number(form.experienceYears) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed. Please try again.');
      setSubmitted(true);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1); setSubmitted(false); setServerError('');
      setFieldErrors({});
      setForm({ fullName: '', email: '', phone: '', password: '', specialties: [], experienceYears: '', languages: ['English'], bio: '' });
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative w-full max-w-lg bg-[#FAF9F6] border border-[#1A1A1A]/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-[#1A1A1A]/10 bg-white shrink-0">
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#1A1A1A]/50 block mb-0.5">
                NESTLY SELLER PROGRAMME
              </span>
              <h2 className="font-serif text-2xl font-black text-[#1A1A1A]">Become a Seller</h2>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-[#1A1A1A]/5 transition-colors">
              <X className="w-5 h-5 text-[#1A1A1A]/50" />
            </button>
          </div>

          {/* Step indicator */}
          {!submitted && (
            <div className="flex px-6 pt-4 gap-2 shrink-0">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex-1 flex flex-col gap-1">
                  <div className={`h-1 transition-all duration-300 ${s <= step ? 'bg-[#1C2B24]' : 'bg-[#1A1A1A]/10'}`} />
                  <span className={`text-[9px] uppercase tracking-wider font-sans font-bold ${s <= step ? 'text-[#1C2B24]' : 'text-[#1A1A1A]/30'}`}>
                    {s === 1 ? 'Identity' : s === 2 ? 'Experience' : 'Bio'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="font-serif text-2xl font-black text-[#1A1A1A]">Application Received!</h3>
                <p className="font-sans text-sm text-[#1A1A1A]/60 max-w-xs leading-relaxed">
                  Your seller account has been created. You can now log in to your Labour Dashboard at <span className="font-bold text-[#1C2B24]">/labour</span> using your email and password.
                </p>
                <button
                  onClick={() => window.open('/labour', '_blank')}
                  className="mt-2 bg-[#1C2B24] text-[#FAF9F6] font-sans font-bold text-[11px] uppercase tracking-widest px-6 py-3 hover:bg-[#2a3d30] transition-colors"
                >
                  Open Labour Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {serverError && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 text-xs p-3 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{serverError}</span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <p className="text-xs text-[#1A1A1A]/60 font-sans mb-2">Start with your personal details and create your login credentials.</p>
                      <SField label="Full Name" icon={<User className="w-4 h-4" />} error={fieldErrors.fullName}>
                        <input type="text" value={form.fullName} onChange={e => updateField('fullName', e.target.value)}
                          placeholder="Jane Doe" className={sInputClass(!!fieldErrors.fullName)} />
                      </SField>
                      <SField label="Email" icon={<Mail className="w-4 h-4" />} error={fieldErrors.email}>
                        <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)}
                          placeholder="jane@example.com" className={sInputClass(!!fieldErrors.email)} />
                      </SField>
                      <SField label="Phone" icon={<Phone className="w-4 h-4" />} error={fieldErrors.phone}>
                        <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)}
                          placeholder="(555) 123-4567" className={sInputClass(!!fieldErrors.phone)} />
                      </SField>
                      <SField label="Password" icon={<Lock className="w-4 h-4" />} error={fieldErrors.password}
                        suffix={<button type="button" onClick={() => setShowPassword(p => !p)} className="text-[#1A1A1A]/40 hover:text-[#1A1A1A]/70">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>}>
                        <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => updateField('password', e.target.value)}
                          placeholder="Min. 8 chars + uppercase + number + symbol" className={sInputClass(!!fieldErrors.password)} />
                      </SField>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                      <p className="text-xs text-[#1A1A1A]/60 font-sans">Select your skills, experience level, and languages.</p>
                      
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/60 mb-2">Specialties <span className="text-[#1A1A1A]/40 normal-case font-normal">(select all that apply)</span></label>
                        <div className="flex flex-wrap gap-2">
                          {SPECIALTY_OPTIONS.map(s => (
                            <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                              className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                                form.specialties.includes(s)
                                  ? 'bg-[#1C2B24] text-white border-[#1C2B24]'
                                  : 'bg-white text-[#1A1A1A]/70 border-[#1A1A1A]/20 hover:border-[#1C2B24]/50'
                              }`}>
                              {s}
                            </button>
                          ))}
                        </div>
                        {fieldErrors.specialties && <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.specialties}</p>}
                      </div>

                      <SField label="Years of Experience" icon={<Briefcase className="w-4 h-4" />} error={fieldErrors.experienceYears}>
                        <input type="number" min="0" max="50" value={form.experienceYears} onChange={e => updateField('experienceYears', e.target.value)}
                          placeholder="e.g. 5" className={sInputClass(!!fieldErrors.experienceYears)} />
                      </SField>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/60 mb-2">Languages Spoken</label>
                        <div className="flex flex-wrap gap-2">
                          {LANGUAGE_OPTIONS.map(l => (
                            <button key={l} type="button" onClick={() => toggleLanguage(l)}
                              className={`px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                                form.languages.includes(l)
                                  ? 'bg-[#1C2B24] text-white border-[#1C2B24]'
                                  : 'bg-white text-[#1A1A1A]/70 border-[#1A1A1A]/20 hover:border-[#1C2B24]/50'
                              }`}>
                              {l}
                            </button>
                          ))}
                        </div>
                        {fieldErrors.languages && <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.languages}</p>}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <p className="text-xs text-[#1A1A1A]/60 font-sans">Write a short professional bio. This will be visible on your public profile.</p>
                      <SField label="Professional Bio" icon={<FileText className="w-4 h-4" />} error={fieldErrors.bio}>
                        <textarea
                          value={form.bio}
                          onChange={e => updateField('bio', e.target.value)}
                          placeholder="Describe your professional background, work ethic, and what makes you the best choice for homeowners..."
                          rows={5}
                          className={`w-full pl-9 pr-4 py-2.5 bg-white border ${
                            fieldErrors.bio ? 'border-red-400' : 'border-[#1A1A1A]/20 focus:border-[#1C2B24]'
                          } focus:ring-1 focus:ring-[#1C2B24]/30 outline-none text-sm font-sans transition-all resize-none`}
                        />
                      </SField>
                      <p className="text-[10px] text-[#1A1A1A]/40 font-sans">{form.bio.length} / 30 min characters</p>

                      <div className="bg-[#1C2B24]/5 border border-[#1C2B24]/20 p-4 space-y-1.5 mt-2">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-[#1C2B24] mb-2">Summary</p>
                        <p className="text-xs font-sans text-[#1A1A1A]/70"><span className="font-bold">Name:</span> {form.fullName}</p>
                        <p className="text-xs font-sans text-[#1A1A1A]/70"><span className="font-bold">Email:</span> {form.email}</p>
                        <p className="text-xs font-sans text-[#1A1A1A]/70"><span className="font-bold">Specialties:</span> {form.specialties.join(', ') || '—'}</p>
                        <p className="text-xs font-sans text-[#1A1A1A]/70"><span className="font-bold">Experience:</span> {form.experienceYears || '—'} years</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer navigation */}
          {!submitted && (
            <div className="px-6 py-4 border-t border-[#1A1A1A]/10 bg-white flex justify-between gap-3 shrink-0">
              {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 text-[11px] font-sans font-bold uppercase tracking-wider text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors px-4 py-2.5 border border-[#1A1A1A]/15 hover:border-[#1A1A1A]/30">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : <div />}

              {step < 3 ? (
                <button onClick={handleNext}
                  className="flex items-center gap-1.5 bg-[#1C2B24] text-[#FAF9F6] font-sans font-bold text-[11px] uppercase tracking-widest px-6 py-2.5 hover:bg-[#2a3d30] transition-colors">
                  Continue <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={isLoading}
                  className="flex items-center gap-1.5 bg-[#1C2B24] text-[#FAF9F6] font-sans font-bold text-[11px] uppercase tracking-widest px-6 py-2.5 hover:bg-[#2a3d30] transition-colors disabled:opacity-60">
                  {isLoading ? <div className="w-4 h-4 border-2 border-[#FAF9F6]/30 border-t-[#FAF9F6] rounded-full animate-spin" /> : <>Submit Application <CheckCircle className="w-3.5 h-3.5" /></>}
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function sInputClass(hasError: boolean) {
  return `w-full pl-9 pr-4 py-2.5 bg-white border ${
    hasError ? 'border-red-400' : 'border-[#1A1A1A]/20 focus:border-[#1C2B24]'
  } focus:ring-1 focus:ring-[#1C2B24]/30 outline-none text-sm font-sans transition-all`;
}

interface SFieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}
function SField({ label, icon, error, suffix, children }: SFieldProps) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A]/60 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-3 text-[#1A1A1A]/40">{icon}</span>
        {children}
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</span>}
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}
