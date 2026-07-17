/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Star, 
  ArrowRight,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import { PROS_POOL, DEFAULT_PRO, Pro } from '../data';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface CustomQuoteFormProps {
  userProfile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    zipCode: string;
    isCreated: boolean;
  };
  onSaveProfile: (profile: any) => void;
  onConfirmBooking: (booking: Booking) => void;
  onCancel: () => void;
}

export default function CustomQuoteForm({
  userProfile,
  onSaveProfile,
  onConfirmBooking,
  onCancel
}: CustomQuoteFormProps) {
  // Form Fields State
  const [name, setName] = useState(userProfile.name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [address, setAddress] = useState(userProfile.address || '');
  const [zipCode, setZipCode] = useState(userProfile.zipCode || '');
  
  // Custom Job State
  const [category, setCategory] = useState('Handyman');
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('Morning (8AM - 12PM)');
  const [budgetBracket, setBudgetBracket] = useState('$150 - $300');
  
  // Success & Error States
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically assign pro based on selected category
  const [matchedPro, setMatchedPro] = useState<Pro>(PROS_POOL[3] || PROS_POOL[0] || DEFAULT_PRO);

  useEffect(() => {
    let pro: Pro | undefined;
    const catLower = category.toLowerCase();
    
    if (catLower.includes('plumb')) {
      pro = PROS_POOL.find(p => p.id === 'pro-marcus');
    } else if (catLower.includes('electric')) {
      pro = PROS_POOL.find(p => p.id === 'pro-devon');
    } else if (catLower.includes('clean')) {
      pro = PROS_POOL.find(p => p.id === 'pro-elena');
    } else {
      pro = PROS_POOL.find(p => p.id === 'pro-sasha');
    }
    
    if (pro) {
      setMatchedPro(pro);
    } else {
      setMatchedPro(PROS_POOL[0] || DEFAULT_PRO);
    }
  }, [category]);

  // Handle Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !email || !phone || !address || !zipCode || !jobTitle || !description || !date) {
      setErrorMsg('Please populate all required fields, including preferred date.');
      return;
    }

    // Save profile details locally so future bookings are pre-populated
    onSaveProfile({
      name,
      email,
      phone,
      address,
      zipCode,
      isCreated: true
    });

    // Create custom booking object
    const customBooking: Booking = {
      id: `quote-${Date.now()}`,
      serviceId: `custom-quote-${category.toLowerCase()}`,
      serviceTitle: `Custom Quote: ${jobTitle}`,
      category: category,
      userName: name,
      userEmail: email,
      userPhone: phone,
      address: address,
      zipCode: zipCode,
      date: date,
      time: timeWindow,
      status: 'Request' as BookingStatus,
      notes: `Custom Job Description: ${description}\nBudget Range: ${budgetBracket}`,
      price: budgetBracket,
      priceValue: budgetBracket.includes('150') ? 225 : budgetBracket.includes('300') ? 450 : 100,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      assignedPro: {
        name: matchedPro.name,
        avatarUrl: '', // Will use the avatar text logic
        rating: matchedPro.rating,
        phone: matchedPro.phone
      }
    };

    setIsSubmitted(true);

    // Give a smooth transitions to the dashboard after success
    setTimeout(() => {
      onConfirmBooking(customBooking);
    }, 2500);
  };

  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 md:px-8 text-center min-h-[60vh] flex flex-col justify-center">
        <h2 className="font-serif text-4xl font-black text-ink mb-4">Create your account</h2>
        <p className="font-sans text-sm text-on-surface-variant/80 mb-10 max-w-xl mx-auto leading-relaxed">
          Please create an account or sign in to book a worker and track your bookings, booking history, and future service requests.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => { setAuthModalTab('register'); setIsAuthModalOpen(true); }}
            className="bg-[#1C2B24] text-[#FAF9F6] font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-8 hover:bg-[#6B9080] transition-colors cursor-pointer"
          >
            Create Account
          </button>
          <button
            onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
            className="bg-transparent border border-[#1A1A1A]/20 text-[#1A1A1A] font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-8 hover:bg-[#1A1A1A]/5 transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          defaultTab={authModalTab}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF9F6] py-16 px-4 md:px-8 border-b border-[#1A1A1A]/10">
      <div className="max-w-[1000px] mx-auto">
        
        {/* Back navigation button */}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#1A1A1A]/60 hover:text-ink mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Services</span>
        </button>

        {isSubmitted ? (
          <div className="bg-white border border-[#1A1A1A]/10 p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-[#F6FFF8] border border-[#6B9080]/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#1C2B24]" />
            </div>
            <span className="bg-[#1C2B24] text-[#FAF9F6] text-[8px] uppercase tracking-[0.2em] font-sans font-bold px-2.5 py-1 inline-block mb-3">
              QUOTE REQUEST SECURED
            </span>
            <h2 className="font-serif text-3xl font-black text-ink tracking-tight mb-4">
              Custom Quote Received
            </h2>
            <p className="font-sans text-sm text-on-surface-variant/80 max-w-md mx-auto mb-6 leading-relaxed">
              Your detailed request has been successfully assigned to <strong>{matchedPro.name}</strong>. They will review your description and contact you via secure workspace messages within 2 hours.
            </p>
            <div className="bg-[#FAF9F6] border border-[#1A1A1A]/5 p-4 text-left rounded-none max-w-sm mx-auto mb-8">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${matchedPro.avatarColor} text-[#1C2B24] flex items-center justify-center font-bold text-xs`}>
                  {matchedPro.avatarText}
                </div>
                <div>
                  <p className="font-serif font-bold text-xs text-ink">{matchedPro.name}</p>
                  <p className="font-sans text-[8px] uppercase tracking-wider text-on-surface-variant/60">
                    {matchedPro.specialties.slice(0, 2).join(' • ')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] font-sans text-[#1C2B24]/60">
              <span className="w-2 h-2 rounded-full bg-[#6B9080] animate-ping" />
              <span>Transporting to your active bookings workspace...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Panel: The Request Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-[#1A1A1A]/10 p-6 md:p-8 space-y-6">
              <div>
                <span className="bg-[#1C2B24] text-[#FAF9F6] text-[8px] uppercase tracking-[0.2em] font-sans font-bold px-2.5 py-0.5 inline-block mb-2">
                  CUSTOM STUDIO
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-black text-ink tracking-tight">
                  Request a Custom Quote
                </h2>
                <p className="font-sans text-xs text-on-surface-variant/70 mt-1">
                  Have a custom requirement, odd job, or specialized remodeling work? Let us know the scope below, and we'll calculate a plain-spoken estimate.
                </p>
              </div>

              {errorMsg && (
                <div className="bg-[#9C2C2C]/5 border-l-2 border-[#9C2C2C] p-3 text-xs text-[#9C2C2C] font-sans">
                  {errorMsg}
                </div>
              )}

              {/* Personal Details Section */}
              <div className="space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest font-sans font-bold text-ink border-b border-[#1A1A1A]/10 pb-1.5">
                  1. Personal & Location Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-on-surface-variant/40 w-4 h-4" />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-on-surface-variant/40 w-4 h-4" />
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                      Service Street Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 text-on-surface-variant/40 w-4 h-4" />
                      <input
                        type="text"
                        required
                        placeholder="123 Main Street"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="90210"
                      maxLength={5}
                      className="w-full px-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 text-on-surface-variant/40 w-4 h-4" />
                    <input
                      type="tel"
                      required
                      placeholder="(555) 000-0000"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Custom Project Details Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-[10px] uppercase tracking-widest font-sans font-bold text-ink border-b border-[#1A1A1A]/10 pb-1.5">
                  2. Custom Project Scope
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                      General Category *
                    </label>
                    <select
                      className="w-full px-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Handyman">General Handyman / Assembly</option>
                      <option value="Plumbing">Custom Plumbing Repair</option>
                      <option value="Electrical">Specialized Electrical Fixes</option>
                      <option value="Cleaning">Deep Estate Detailing / Clean</option>
                      <option value="Yard Care">Bespoke Landscaping & Yard Care</option>
                      <option value="Custom">Other Custom Craft / Remodeling</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                      Short Job Title *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3.5 text-on-surface-variant/40 w-4 h-4" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Build Custom Cedar Shelves"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                    Job Description & Custom Requirements *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe exactly what needs fixing, building, or cleaning. Please list materials if already owned, size specifications, and any unique constraints."
                    className="w-full px-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 text-on-surface-variant/40 w-4 h-4 pointer-events-none" />
                      <input
                        type="date"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                      Preferred Time Window *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3.5 text-on-surface-variant/40 w-4 h-4" />
                      <select
                        className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                        value={timeWindow}
                        onChange={(e) => setTimeWindow(e.target.value)}
                      >
                        <option value="Morning (8AM - 12PM)">Morning (8AM - 12PM)</option>
                        <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
                        <option value="Evening (4PM - 8PM)">Evening (4PM - 8PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider font-sans font-bold text-ink/70 mb-1.5">
                      Target Budget *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3.5 text-on-surface-variant/40 w-4 h-4" />
                      <select
                        className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                        value={budgetBracket}
                        onChange={(e) => setBudgetBracket(e.target.value)}
                      >
                        <option value="Under $150">Under $150</option>
                        <option value="$150 - $300">$150 - $300</option>
                        <option value="$300 - $600">$300 - $600</option>
                        <option value="$600+">$600+</option>
                        <option value="To Be Quoted By Pro">TBD / Quote Required</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1A1A] text-white hover:bg-[#1C2B24] font-sans font-bold text-xs uppercase tracking-widest py-4 rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Submit Secure Custom Request</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Right Panel: Specialist assignment info & Guarantees */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Specialist Real-time Recommendation */}
              <div className="bg-[#1C2B24] text-white p-6 md:p-8 border border-[#1A1A1A]/10">
                <span className="text-[#F4A261] text-[8px] uppercase tracking-[0.25em] font-sans font-bold block mb-1">
                  REAL-TIME SPECIALIST ALIGNMENT
                </span>
                <h3 className="font-serif text-xl font-black text-white tracking-tight mb-4">
                  Vetted Pro Preview
                </h3>
                <p className="font-sans text-xs text-[#FAF9F6]/75 mb-6 leading-relaxed">
                  Based on your chosen Category (<strong>{category}</strong>), our system has matched you with one of our highest-rated on-staff specialists.
                </p>

                <div className="bg-white/5 border border-white/10 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[8px] uppercase tracking-widest text-[#FAF9F6]/60 font-sans font-bold">
                      ASSIGNED SPECIALIST
                    </span>
                    <div className="flex items-center text-[#F4A261] text-[10px] font-bold gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{matchedPro.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${matchedPro.avatarColor} text-[#1C2B24] flex items-center justify-center font-bold text-xs shrink-0`}>
                      {matchedPro.avatarText}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-white leading-tight">
                        {matchedPro.name}
                      </h4>
                      <p className="font-sans text-[8px] uppercase tracking-wider text-[#FAF9F6]/60 mt-0.5">
                        {matchedPro.experienceYears} Years Vetted • {matchedPro.completedJobs}+ Jobs Done
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <p className="font-sans text-[10px] text-white/70 italic">
                      "{matchedPro.bio}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust Factors Card */}
              <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 space-y-4">
                <h3 className="font-serif text-base font-bold text-ink leading-tight">
                  The Nestly Vetting Standard
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#6B9080] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-sans text-[10px] uppercase tracking-wider font-bold text-ink">
                        Background Vetted Staff
                      </h4>
                      <p className="font-sans text-[10px] text-on-surface-variant/70 leading-normal">
                        We do not run an open marketplace. Every single Pro is a certified, background-screened Nestly employee.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#6B9080] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-sans text-[10px] uppercase tracking-wider font-bold text-ink">
                        Accurate Client Billing
                      </h4>
                      <p className="font-sans text-[10px] text-on-surface-variant/70 leading-normal">
                        No surprise surcharges or dispatch travel broker fees. You only pay for active labor hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
