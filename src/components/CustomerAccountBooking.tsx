/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Calendar, 
  Clock, 
  Send, 
  MessageSquare, 
  CheckCircle, 
  ArrowLeft, 
  ShieldCheck, 
  Star 
} from 'lucide-react';
import { Service, Booking, BookingStatus } from '../types';
import { PROS_POOL, DEFAULT_PRO, Pro } from '../data';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface CustomerAccountBookingProps {
  selectedService: Service;
  selectedPro?: Pro | null;
  userProfile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    zipCode: string;
    isCreated: boolean;
  };
  onSaveProfile: (profile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    zipCode: string;
  }) => void;
  onConfirmBooking: (booking: Booking) => void;
  onCancel: () => void;
}

export default function CustomerAccountBooking({
  selectedService,
  selectedPro,
  userProfile,
  onSaveProfile,
  onConfirmBooking,
  onCancel,
}: CustomerAccountBookingProps) {
  // Step in checkout: 'account' or 'details'
  const [step, setStep] = useState<'account' | 'details'>(
    userProfile.isCreated ? 'details' : 'account'
  );

  // Registration Form State
  const [name, setName] = useState(userProfile.name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [address, setAddress] = useState(userProfile.address || '');
  const [zipCode, setZipCode] = useState(userProfile.zipCode || '');
  const [password, setPassword] = useState('');

  // Booking fields state
  const [workTitle, setWorkTitle] = useState(selectedService.title || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  // Find a matching pro or use explicitly selectedPro
  const matchedPro: Pro = selectedPro || PROS_POOL.find(pro => 
    pro.services.includes(selectedService.id)
  ) || PROS_POOL[0];

  // Chat interface state (Direct messaging with assigned Pro)
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'pro'; text: string; time: string }[]>([
    {
      sender: 'pro',
      text: `Hello! I'm ${matchedPro.name}, your assigned Nestly Premium Pro. If you have any questions or custom requests for this service, drop them here!`,
      time: 'Just now',
    },
  ]);

  useEffect(() => {
    if (userProfile.isCreated) {
      setStep('details');
      setName(userProfile.name);
      setEmail(userProfile.email);
      setPhone(userProfile.phone);
      setAddress(userProfile.address);
      setZipCode(userProfile.zipCode);
    }
  }, [userProfile]);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !address || !zipCode) {
      alert('Please fill out all required fields.');
      return;
    }
    // Save profile to state & local storage
    onSaveProfile({ name, email, phone, address, zipCode });
    setStep('details');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text: userMsg, time: 'Just now' },
    ]);
    setChatInput('');

    // Trigger realistic automated Pro response based on the message content after a brief delay
    setTimeout(() => {
      let responseText = `Got it! I am reviewing your request. I specialize in ${matchedPro.specialties[0]} and will ensure everything is neat. Is there any particular detail I should note?`;
      if (userMsg.toLowerCase().includes('time') || userMsg.toLowerCase().includes('when')) {
        responseText = `Yes, I can absolutely accommodate that time window. I'll make sure to update my route and notify you as soon as I am en route!`;
      } else if (userMsg.toLowerCase().includes('leak') || userMsg.toLowerCase().includes('faucet') || userMsg.toLowerCase().includes('clog')) {
        responseText = `Understood. I will bring my professional diagnostics kit, shutoff keys, and heavy-duty sealant. Rest assured, I will resolve this.`;
      } else if (userMsg.toLowerCase().includes('clean') || userMsg.toLowerCase().includes('sweep') || userMsg.toLowerCase().includes('dust')) {
        responseText = `Excellent. I use eco-friendly HEPA-vetted detergents. I'll focus on high-touch zones as well!`;
      }
      
      setChatMessages(prev => [
        ...prev,
        { sender: 'pro', text: responseText, time: '1s ago' },
      ]);
    }, 1500);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      alert('Please select a preferred date and time.');
      return;
    }

    const newBooking: Booking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: selectedService.id,
      serviceTitle: workTitle.trim() || selectedService.title,
      category: selectedService.category,
      userName: name,
      userEmail: email,
      userPhone: phone,
      address: address,
      zipCode: zipCode,
      date: date,
      time: time,
      status: 'Request',
      price: selectedService.price,
      priceValue: selectedService.priceValue,
      notes: notes,
      createdAt: new Date().toISOString(),
      assignedPro: {
        name: matchedPro.name,
        avatarUrl: matchedPro.avatarText,
        rating: matchedPro.rating,
        phone: matchedPro.phone,
      },
    };

    onConfirmBooking(newBooking);
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
            className="bg-[#1C2B24] text-[#FAF9F6] font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-8 hover:bg-[#6B9080] transition-colors"
          >
            Create Account
          </button>
          <button
            onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
            className="bg-transparent border border-[#1A1A1A]/20 text-[#1A1A1A] font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-8 hover:bg-[#1A1A1A]/5 transition-colors"
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
    <div className="max-w-5xl mx-auto py-8 px-4 md:px-8">
      {/* Return Back Link */}
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#1C2B24] hover:opacity-80 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Services Catalog</span>
      </button>

      {/* Booking Header */}
      <div className="mb-8 border-b border-[#1A1A1A]/10 pb-6">
        <span className="bg-[#1C2B24] text-[#F6FFF8] px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] font-sans font-bold inline-block mb-3">
          SECURE CLIENT CHECKOUT
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-black text-ink tracking-tight">
          Nestly Scheduling Core
        </h2>
        <p className="font-sans text-sm text-on-surface-variant/80 mt-1 max-w-2xl">
          Complete your account registration, adjust booking slots, and chat directly with your assigned Premium Labor Specialist prior to scheduling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Flow Forms */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 border border-[#1A1A1A]/10 rounded-none shadow-none">
          {/* Checkout Stepper Progress */}
          <div className="flex items-center gap-6 mb-8 text-[10px] uppercase tracking-wider font-bold">
            <span className={`pb-2 border-b-2 transition-all ${step === 'account' ? 'border-[#1C2B24] text-ink' : 'border-transparent text-on-surface-variant/40'}`}>
              1. Customer Account
            </span>
            <span className={`pb-2 border-b-2 transition-all ${step === 'details' ? 'border-[#1C2B24] text-ink' : 'border-transparent text-on-surface-variant/40'}`}>
              2. Booking & Contact Labor
            </span>
          </div>

          <AnimatePresence mode="wait">
            {step === 'account' ? (
              <motion.div
                key="account-registration"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h3 className="font-serif text-2xl font-black text-ink tracking-tight">
                    Create Your Customer Account
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant/80 mt-1">
                    Your details will be saved to your custom Nestly space. Logged-in customers gain instant access to interactive service timelines and direct live message contact with their assigned certified Pros.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-sans font-bold text-ink mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/10 text-xs focus:ring-1 focus:ring-[#1C2B24] focus:outline-none rounded-none font-sans"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-sans font-bold text-ink mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                        <input
                          type="tel"
                          required
                          placeholder="(555) 123-4567"
                          className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/10 text-xs focus:ring-1 focus:ring-[#1C2B24] focus:outline-none rounded-none font-sans"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-sans font-bold text-ink mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                        <input
                          type="email"
                          required
                          placeholder="jane.doe@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/10 text-xs focus:ring-1 focus:ring-[#1C2B24] focus:outline-none rounded-none font-sans"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-sans font-bold text-ink mb-1">
                      Choose Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/10 text-xs focus:ring-1 focus:ring-[#1C2B24] focus:outline-none rounded-none font-sans"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-sans font-bold text-ink mb-1">
                      Street Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" />
                      <input
                        type="text"
                        required
                        placeholder="124 Maple Ave"
                        className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/10 text-xs focus:ring-1 focus:ring-[#1C2B24] focus:outline-none rounded-none font-sans"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-sans font-bold text-ink mb-1">
                      Zip / Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      pattern="[0-9]{5}"
                      placeholder="98101"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/10 text-xs focus:ring-1 focus:ring-[#1C2B24] focus:outline-none rounded-none font-sans"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1C2B24] text-[#FAF9F6] font-sans font-bold text-xs uppercase tracking-widest py-4 rounded-none hover:bg-opacity-95 transition-all cursor-pointer mt-6"
                  >
                    Create Account & Proceed
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="booking-details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mb-6">
                  <h3 className="font-serif text-2xl font-black text-ink tracking-tight">
                    Refine Booking Details
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant/80 mt-1">
                    Logged in as <span className="font-bold text-ink">{userProfile.name}</span> ({userProfile.email}). Adjust scheduling slot preferences below to assign {matchedPro.name}.
                  </p>
                </div>

                <form onSubmit={handleConfirmSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-sans font-bold text-[#1C2B24] mb-1">
                      Work Required / Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kitchen sink pipe repair & faucet fixture installation"
                      className="w-full px-4 py-3 bg-[#F6FFF8] border border-[#6B9080]/20 text-xs focus:ring-1 focus:ring-[#6B9080] focus:outline-none rounded-none font-sans font-bold text-ink"
                      value={workTitle}
                      onChange={(e) => setWorkTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-sans font-bold text-[#1C2B24] mb-1">
                        Preferred Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C2B24]/70" />
                        <input
                          type="date"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-[#F6FFF8] border border-[#6B9080]/20 text-xs focus:ring-1 focus:ring-[#6B9080] focus:outline-none rounded-none font-sans font-bold"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-sans font-bold text-[#1C2B24] mb-1">
                        Preferred Time *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1C2B24]/70" />
                        <input
                          type="time"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-[#F6FFF8] border border-[#6B9080]/20 text-xs focus:ring-1 focus:ring-[#6B9080] focus:outline-none rounded-none font-sans font-bold"
                          value={time}
                          onChange={(e) => setTime}
                          onInput={(e: any) => setTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-sans font-bold text-ink mb-1">
                      Special Instructions / Job Details
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Give us details about what is required (e.g., Faucet brand/model, shut-off valve location, specific heights, wall material for TV mount...)"
                      className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/10 text-xs focus:ring-1 focus:ring-[#1C2B24] focus:outline-none rounded-none font-sans"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Vetted badge callout info */}
                  <div className="bg-[#F6FFF8] border border-[#6B9080]/15 p-4 flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-[#6B9080] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-sans text-[10px] uppercase tracking-wider font-bold text-[#1C2B24]">
                        Nestly Verified Quality Assurance
                      </h4>
                      <p className="font-sans text-[10px] text-[#1C2B24]/80 mt-0.5 leading-relaxed">
                        This service is fully covered under the Nestly $10,000 Property Damage Guarantee. You will only be billed once {matchedPro.name} successfully completes the work and you sign off.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1C2B24] text-white font-sans font-bold text-xs uppercase tracking-widest py-4 rounded-none hover:bg-opacity-90 transition-all cursor-pointer mt-4"
                  >
                    Confirm Booking with {matchedPro.name}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Service summary + Live Chat Contact with matched Pro */}
        <div className="lg:col-span-5 space-y-6">
          {/* Service Pricing & Outline Card */}
          <div className="bg-white p-6 border border-[#1A1A1A]/10 rounded-none">
            <span className="text-[8px] uppercase tracking-[0.2em] font-sans font-bold opacity-60 block mb-1">SELECTED TASK</span>
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-serif text-xl font-bold text-ink leading-tight">
                {selectedService.title}
              </h4>
              <span className="bg-[#F6FFF8] text-[#6B9080] border border-[#6B9080]/20 font-sans font-bold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-none">
                {selectedService.category}
              </span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant/80 mb-4 leading-relaxed">
              {selectedService.description}
            </p>

            <div className="bg-[#FAF9F6] p-3 border-t border-[#1A1A1A]/5 flex justify-between items-center">
              <span className="font-sans text-[9px] uppercase tracking-wider text-on-surface-variant/70">
                Service Rate
              </span>
              <span className="font-serif text-lg font-black text-ink">
                {selectedService.price}
              </span>
            </div>
          </div>

          {/* Assigned Worker / Live Contact Drawer Panel */}
          <div className="bg-white border border-[#1A1A1A]/10 rounded-none overflow-hidden">
            {/* Header / Premium Profile Detail */}
            <div className="bg-[#1C2B24] text-white p-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-none flex items-center justify-center font-bold text-sm ${matchedPro.avatarColor}`}>
                  {matchedPro.avatarText}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-base text-white leading-tight">
                      {matchedPro.name}
                    </h4>
                    <span className="bg-[#F4A261] text-[#1C2B24] text-[7px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-none">
                      Premium
                    </span>
                  </div>
                  <p className="font-sans text-[9px] uppercase tracking-wider text-[#FAF9F6]/70 mt-0.5">
                    {matchedPro.specialties.join(' • ')}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#FAF9F6]/10 text-center">
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-[#FAF9F6]/60">Rating</p>
                  <p className="font-serif text-xs font-bold text-[#F4A261] flex items-center justify-center gap-0.5 mt-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>{matchedPro.rating}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-[#FAF9F6]/60">Experience</p>
                  <p className="font-serif text-xs font-bold text-[#FAF9F6] mt-0.5">{matchedPro.experienceYears} Years</p>
                </div>
                <div>
                  <p className="text-[8px] uppercase tracking-wider text-[#FAF9F6]/60">Jobs Done</p>
                  <p className="font-serif text-xs font-bold text-[#FAF9F6] mt-0.5">{matchedPro.completedJobs}+</p>
                </div>
              </div>
            </div>

            {/* Chat Conversation Content */}
            <div className="p-4 bg-[#FAF9F6]">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 bg-[#6B9080] rounded-full animate-pulse"></span>
                <span className="font-sans text-[9px] uppercase tracking-wider text-[#1C2B24] font-bold">
                  Direct Messenger (Vetted Internal Line)
                </span>
              </div>

              {/* Messages Body */}
              <div className="h-[180px] overflow-y-auto space-y-3 bg-white p-3 border border-[#1A1A1A]/5 flex flex-col">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[85%] p-2.5 rounded-none text-[11px] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1C2B24] text-white self-end font-sans'
                        : 'bg-[#FAF9F6] text-ink border border-[#1A1A1A]/10 self-start font-sans'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-[7px] uppercase opacity-50 block text-right mt-1 font-mono">
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chat Form */}
              <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder={`Ask ${matchedPro.name.split(' ')[0]} a question...`}
                  className="flex-grow px-3 py-2 bg-white border border-[#1A1A1A]/15 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#1C2B24] rounded-none font-sans"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-[#1C2B24] text-white p-2 hover:bg-opacity-90 rounded-none transition-all cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
