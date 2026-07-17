/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Calendar, 
  CreditCard, 
  ShieldAlert, 
  User, 
  MessageSquare, 
  Mail, 
  AlertTriangle, 
  ChevronDown, 
  UploadCloud, 
  Send, 
  X, 
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { Booking } from '../types';

interface SupportProps {
  bookings: Booking[];
}

interface Complaint {
  id: string;
  bookingRef: string;
  issueType: string;
  description: string;
  attachments: string[];
  status: 'Under Review' | 'Investigating' | 'Resolved';
  dateSubmitted: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

export default function Support({ bookings }: SupportProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<{ q: string; a: string; category: string } | null>(null);

  // Complaint form states
  const [bookingRef, setBookingRef] = useState('');
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<{ name: string; size: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Complaints history (persisted in localStorage)
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('nestly_complaints');
    return saved ? JSON.parse(saved) : [];
  });

  // Chat window state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      text: "Hello! Welcome to Nestly Premium Support. I'm your digital concierge. How can I assist you with your household services today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // Persist complaints
  useEffect(() => {
    localStorage.setItem('nestly_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Pre-populate booking reference if any bookings exist
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      setBookingRef(bookings[0].id);
    }
  }, [bookings]);

  // Knowledge Base Articles
  const articles = [
    {
      category: 'Bookings & Scheduling',
      q: 'How to cancel or reschedule a booking?',
      a: 'You can cancel or reschedule any of your active bookings directly from the "My Bookings" tab on your dashboard. Cancellations or changes made more than 24 hours prior to the scheduled window are fully free. If your booking is within 24 hours, contact support directly to coordinate.',
      keywords: ['cancel', 'reschedule', 'booking', 'change', 'move', 'date', 'time']
    },
    {
      category: 'Bookings & Scheduling',
      q: 'What happens if a professional is late?',
      a: 'Nestly maintains high standards of punctuality. In the rare event of a delay due to traffic or weather, you will receive real-time notifications on your active tracker. If a pro is more than 15 minutes late, our support team proactively investigates and offers service adjustment credits.',
      keywords: ['late', 'delayed', 'punctuality', 'no-show', 'pro', 'time']
    },
    {
      category: 'Payments & Refunds',
      q: 'Nestly Refund & Satisfaction Policy',
      a: 'We stand by our certified work quality. If you are not fully satisfied with a service, please report the issue within 72 hours of completion through our "Raise a Complaint" form. We will dispatch a senior inspector to review and complete the correction at no additional cost, or issue a full refund.',
      keywords: ['refund', 'money', 'satisfaction', 'guarantee', 'quality', 'bad', 'poor', 'policy']
    },
    {
      category: 'Payments & Refunds',
      q: 'How are payment cards processed?',
      a: 'We authorize payment cards when you confirm a booking, but we never capture the funds or finalize the transaction until your certified Pro completes the job to your high satisfaction. Invoices are emailed instantly after job wrap.',
      keywords: ['payment', 'failed', 'billing', 'card', 'charge', 'invoice', 'receipt', 'price']
    },
    {
      category: 'Service Quality',
      q: 'What are Nestly Pro background requirements?',
      a: 'Every Nestly Pro is an internal, background-checked employee—not a gig-worker. They undergo an intensive 5-step vetting process, including state and federal background verification, reference checks, certified tool and safety checks, and practical skills evaluation.',
      keywords: ['trust', 'safety', 'vetting', 'requirements', 'pro', 'background', 'employee']
    },
    {
      category: 'Account Details',
      q: 'How to reset my password or update my address?',
      a: 'Go to your account profile to reset security codes or update your addresses. For your security, saved credit cards and permanent residential addresses require a secondary secure confirmation step.',
      keywords: ['reset', 'password', 'address', 'profile', 'security', 'account', 'email']
    }
  ];

  // Filter articles based on search query
  const filteredArticles = searchQuery 
    ? articles.filter(art => 
        art.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        art.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.keywords.some(kw => searchQuery.toLowerCase().includes(kw))
      )
    : [];

  // Handle support search submission
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedArticle(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map((f: any) => ({
        name: f.name,
        size: `${(f.size / 1024 / 1024).toFixed(2)} MB`
      }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f: any) => ({
        name: f.name,
        size: `${(f.size / 1024 / 1024).toFixed(2)} MB`
      }));
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRef || !issueType || !description) {
      alert('Please fill out all required fields.');
      return;
    }

    const complaintId = `CMP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newComplaint: Complaint = {
      id: complaintId,
      bookingRef,
      issueType,
      description,
      attachments: attachments.map(a => a.name),
      status: 'Under Review',
      dateSubmitted: new Date().toLocaleDateString()
    };

    setComplaints(prev => [newComplaint, ...prev]);
    setSubmittedComplaint(newComplaint);
    setSubmitSuccess(true);

    // Reset Form
    setIssueType('');
    setDescription('');
    setAttachments([]);
  };

  // Bot response simulator
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const queryText = chatInput.toLowerCase();
    setChatInput('');

    // Generate automated smart concierge response based on keywords
    setTimeout(() => {
      let replyText = "Thank you for the message. I have logged your request with our active duty dispatch managers. They will connect directly with you or update your service tracker shortly. Is there anything else I can coordinate for you?";
      
      if (queryText.includes('cancel') || queryText.includes('reschedule') || queryText.includes('booking')) {
        replyText = "For booking changes, you can manage appointments in real time under the 'Bookings' tab. No-fee rescheduling is permitted up to 24 hours in advance. Would you like me to flag our desk to call you for custom scheduling help?";
      } else if (queryText.includes('refund') || queryText.includes('price') || queryText.includes('billing')) {
        replyText = "Your billing safety is guaranteed. We never capture payments until our Pro logs the job as complete. If you require a billing adjustment, refund review, or itemized receipt, please submit details in the 'Raise a Complaint' form below, and we will process it within 2 hours.";
      } else if (queryText.includes('late') || queryText.includes('where is') || queryText.includes('delayed')) {
        replyText = "I understand. Your Pro is on a managed route. You can view their precise dispatch travel status in the 'My Bookings' live stepper tracker. Rest assured, all travel is covered by our on-time guarantee.";
      } else if (queryText.includes('hello') || queryText.includes('hi') || queryText.includes('hey')) {
        replyText = "Greetings from Nestly Support! I'm here to ensure your premium home services are completed with pristine precision. How can I help you find answers or manage bookings today?";
      }

      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'agent',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, agentMsg]);
    }, 1000);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
      
      {/* Help Hero Search Section */}
      <section className="text-center max-w-3xl mx-auto w-full flex flex-col items-center gap-6 mb-16">
        <span className="bg-[#1C2B24] text-[#FAF9F6] px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-sans font-bold inline-block">
          NESTLY HELP CENTER & CONCIERGE
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-black text-ink tracking-tight">
          How can we help you today?
        </h1>
        <p className="font-sans text-sm text-on-surface-variant/80 max-w-xl leading-relaxed">
          Search our knowledge base for standard protocols, refund safety rules, or instantly log service tickets with our certified crew.
        </p>

        {/* Dynamic Search Box */}
        <div className="relative w-full max-w-2xl mt-4 z-20">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant z-10">
            <Search className="w-5 h-5 text-primary" />
          </span>
          <input
            type="text"
            className="w-full h-14 bg-white border border-[#1A1A1A]/10 rounded-none py-3 pl-12 pr-6 font-sans text-sm focus:outline-none focus:border-primary transition-all shadow-sm"
            placeholder="Search for 'refund policy', 'cancel', 'late', 'payment failed'..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          
          {/* Quick Clear */}
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setSelectedArticle(null); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-primary cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dynamic Search Results dropdown */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full max-w-2xl bg-white border border-[#1A1A1A] p-4 text-left shadow-lg -mt-2 relative z-30"
            >
              <h3 className="text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-2 border-b border-[#1A1A1A]/10 pb-1 flex justify-between">
                <span>Matching Articles ({filteredArticles.length})</span>
                <span className="text-on-surface-variant/50 font-normal">Real-Time Search</span>
              </h3>
              
              {filteredArticles.length === 0 ? (
                <p className="text-xs text-on-surface-variant/70 italic p-3">
                  No direct answers found for "{searchQuery}". Try browsing the bento categories below or raise a complaint directly.
                </p>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {filteredArticles.map((art, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 hover:bg-[#FAF9F6] border-l-2 border-[#1C2B24] transition-all cursor-pointer"
                      onClick={() => setSelectedArticle(art)}
                    >
                      <h4 className="font-serif font-bold text-sm text-ink mb-1">{art.q}</h4>
                      <p className="font-sans text-xs text-on-surface-variant/80 line-clamp-2">
                        {art.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Article Detail View Modal Overlay */}
        <AnimatePresence>
          {selectedArticle && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
              onClick={() => setSelectedArticle(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-[#FAF9F6] border border-[#1A1A1A] rounded-none p-6 md:p-8 max-w-xl w-full text-left relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="absolute right-4 top-4 text-on-surface-variant hover:text-ink cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="bg-[#1C2B24] text-white text-[8px] tracking-widest font-sans font-bold uppercase px-2 py-0.5 inline-block mb-3">
                  {selectedArticle.category}
                </span>
                <h3 className="font-serif text-2xl font-black text-ink mb-4 leading-tight">
                  {selectedArticle.q}
                </h3>
                <div className="font-sans text-xs text-on-surface-variant/90 leading-relaxed space-y-3 bg-white p-4 border border-[#1A1A1A]/10">
                  <p>{selectedArticle.a}</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="bg-[#1A1A1A] hover:bg-black text-[#FAF9F6] font-sans font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-none cursor-pointer"
                  >
                    Close Article
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popular searches */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          <span className="font-sans text-[10px] uppercase tracking-widest text-[#1A1A1A]/50">Popular:</span>
          {[
            { tag: 'Cancel a booking', category: 'Bookings & Scheduling', q: 'How to cancel a booking', a: 'You can cancel any scheduled booking up to 2 hours before the appointment start time without penalty. Navigate to your Bookings portal, select the active appointment, and click "Cancel Booking".' },
            { tag: 'Payment failed', category: 'Payments & Refunds', q: 'Billing fails & updates', a: 'If a payment hold fails, your booking will remain temporarily reserved for 2 hours while we notify you via email and SMS. Update your payment method in your Account Settings or during checkout.' },
            { tag: 'Refund Policy', category: 'Payments & Refunds', q: 'Refund & guarantee policy', a: 'Every Nestly service is backed by our 100% Satisfaction Guarantee. If any completed job does not meet our strict quality standards, we will either dispatch a senior specialist to re-perform the work at zero cost or issue a complete refund within 48 hours.' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setSelectedArticle({ category: item.category, q: item.q, a: item.a })}
              className="font-sans text-[10px] uppercase tracking-widest text-[#1C2B24] font-bold hover:underline underline-offset-4 cursor-pointer decoration-[#6B9080]"
            >
              {item.tag}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid Content: Categories & Quick Contact Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        
        {/* Bento Categories column */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Bookings & Scheduling */}
          <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 flex flex-col justify-between hover:border-primary transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-[#FAF9F6] border border-[#1C2B24]/10 flex items-center justify-center text-primary mb-5">
                <Calendar className="w-5 h-5 text-[#1C2B24]" />
              </div>
              <h3 className="font-serif font-black text-xl text-ink mb-2">Bookings & Scheduling</h3>
              <p className="font-sans text-xs text-on-surface-variant/80 leading-relaxed mb-6">
                Understand rules about appointment coordination, rescheduling windows, and on-time guarantees.
              </p>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-[#1A1A1A]/5">
              <button 
                onClick={() => setSelectedArticle({
                  category: 'Bookings & Scheduling',
                  q: 'How to cancel a booking',
                  a: 'You can cancel any scheduled booking up to 2 hours before the appointment start time without penalty. Navigate to your Bookings portal, select the active appointment, and click "Cancel Booking". Any pre-authorized card holds will be released within 1-2 business days.'
                })}
                className="w-full text-left flex items-center justify-between text-xs font-sans text-[#1C2B24] font-bold hover:underline group cursor-pointer"
              >
                <span>How to cancel a booking</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setSelectedArticle({
                  category: 'Bookings & Scheduling',
                  q: 'Rescheduling a pro',
                  a: 'Need a different time slot? Go to your Bookings tab, select "Reschedule", and pick a new date and time from your professional\'s real-time availability calendar. Rescheduling is free when requested at least 4 hours in advance.'
                })}
                className="w-full text-left flex items-center justify-between text-xs font-sans text-[#1C2B24] font-bold hover:underline group cursor-pointer"
              >
                <span>Rescheduling a pro</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Payments & Refunds */}
          <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 flex flex-col justify-between hover:border-primary transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-[#FAF9F6] border border-[#1C2B24]/10 flex items-center justify-center text-primary mb-5">
                <CreditCard className="w-5 h-5 text-[#1C2B24]" />
              </div>
              <h3 className="font-serif font-black text-xl text-ink mb-2">Payments & Refunds</h3>
              <p className="font-sans text-xs text-on-surface-variant/80 leading-relaxed mb-6">
                Explore transparent billing guidelines, card hold policies, and service satisfaction guarantees.
              </p>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-[#1A1A1A]/5">
              <button 
                onClick={() => setSelectedArticle({
                  category: 'Payments & Refunds',
                  q: 'Refund & guarantee policy',
                  a: 'Every Nestly service is backed by our 100% Satisfaction Guarantee. If any completed job does not meet our strict quality standards, we will either dispatch a senior specialist to re-perform the work at zero cost or issue a complete refund within 48 hours.'
                })}
                className="w-full text-left flex items-center justify-between text-xs font-sans text-[#1C2B24] font-bold hover:underline group cursor-pointer"
              >
                <span>Refund & guarantee policy</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setSelectedArticle({
                  category: 'Payments & Refunds',
                  q: 'Billing fails & updates',
                  a: 'If a payment hold fails, your booking will remain temporarily reserved for 2 hours while we notify you via email and SMS. Update your payment method in your Account Settings or during checkout to confirm dispatch.'
                })}
                className="w-full text-left flex items-center justify-between text-xs font-sans text-[#1C2B24] font-bold hover:underline group cursor-pointer"
              >
                <span>Billing fails & updates</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 3: Service Quality */}
          <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 flex flex-col justify-between hover:border-primary transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-[#FAF9F6] border border-[#1C2B24]/10 flex items-center justify-center text-primary mb-5">
                <ShieldAlert className="w-5 h-5 text-[#1C2B24]" />
              </div>
              <h3 className="font-serif font-black text-xl text-ink mb-2">Service Quality</h3>
              <p className="font-sans text-xs text-on-surface-variant/80 leading-relaxed mb-6">
                Learn how our fully-employed, background-vetted specialists deliver elite quality across plumbing, wiring, and custom repairs.
              </p>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-[#1A1A1A]/5">
              <button 
                onClick={() => setSelectedArticle({
                  category: 'Service Quality',
                  q: 'Trust & Employee Safety',
                  a: 'Every Nestly specialist carries comprehensive general liability and workers\' compensation coverage up to $2M. You are fully protected against any accidental property damage or on-site incident.'
                })}
                className="w-full text-left flex items-center justify-between text-xs font-sans text-[#1C2B24] font-bold hover:underline group cursor-pointer"
              >
                <span>Trust & Employee Safety</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setSelectedArticle({
                  category: 'Service Quality',
                  q: 'Pro background employee vetting',
                  a: 'Unlike peer-to-peer directories, all Nestly professionals undergo comprehensive multi-state criminal background checks, identity verification, license validation, and hands-on technical skill assessment before dispatching to any home.'
                })}
                className="w-full text-left flex items-center justify-between text-xs font-sans text-[#1C2B24] font-bold hover:underline group cursor-pointer"
              >
                <span>Pro background employee vetting</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 4: Account Details */}
          <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 flex flex-col justify-between hover:border-primary transition-all duration-300">
            <div>
              <div className="w-10 h-10 bg-[#FAF9F6] border border-[#1C2B24]/10 flex items-center justify-center text-primary mb-5">
                <User className="w-5 h-5 text-[#1C2B24]" />
              </div>
              <h3 className="font-serif font-black text-xl text-ink mb-2">Account Details</h3>
              <p className="font-sans text-xs text-on-surface-variant/80 leading-relaxed mb-6">
                Manage your credentials, change saved service address regions, or update contact notifications.
              </p>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-[#1A1A1A]/5">
              <button 
                onClick={() => setSelectedArticle({
                  category: 'Account Details',
                  q: 'Resetting secure passcodes',
                  a: 'To change your password, sign in to your Account Profile and click "Update Password". If you are locked out, use the "Forgot Password" link on the Sign In modal to receive a secure one-time verification link via email.'
                })}
                className="w-full text-left flex items-center justify-between text-xs font-sans text-[#1C2B24] font-bold hover:underline group cursor-pointer"
              >
                <span>Resetting secure passcodes</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setSelectedArticle({
                  category: 'Account Details',
                  q: 'Changing saved address files',
                  a: 'You can update your default residential address and regional service zone inside the Profile tab. New bookings will automatically inherit your saved address while allowing custom locations per dispatch.'
                })}
                className="w-full text-left flex items-center justify-between text-xs font-sans text-[#1C2B24] font-bold hover:underline group cursor-pointer"
              >
                <span>Changing saved address files</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </div>

        {/* Live Concierge Contact Column */}
        <div className="lg:col-span-4">
          <div className="bg-[#1C2B24] text-[#FAF9F6] p-8 border border-[#1C2B24] h-full flex flex-col justify-between relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none">
              <MessageSquare className="w-56 h-56" />
            </div>

            <div className="relative z-10">
              <span className="bg-white/10 text-[#FAF9F6] text-[8px] font-sans font-bold uppercase tracking-[0.2em] px-3 py-1 inline-block border border-white/15 mb-4">
                CERTIFIED DESK AVAILABLE 24/7
              </span>
              <h3 className="font-serif font-black text-2xl mb-3 text-white leading-tight">
                Need immediate resolution?
              </h3>
              <p className="font-sans text-xs text-[#FAF9F6]/80 leading-relaxed mb-8">
                Our centrally managed concierge desks are staffed around the clock to handle route delays, emergency water turn-offs, or billing disputes.
              </p>
            </div>

            <div className="relative z-10 space-y-3">
              <button
                onClick={() => setChatOpen(true)}
                className="w-full bg-[#FAF9F6] text-[#1C2B24] hover:bg-[#FAF9F6]/90 font-sans font-bold text-[10px] uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-all cursor-pointer rounded-none"
              >
                <MessageSquare className="w-4 h-4 text-[#1C2B24]" />
                <span>Start Live Chat</span>
              </button>
              <a
                href="mailto:support@nestly.com?subject=Nestly Service Assistance Inquiry"
                className="w-full bg-[#1C2B24] text-white hover:bg-black/20 font-sans font-bold text-[10px] uppercase tracking-widest py-4 flex items-center justify-center gap-2 border border-[#FAF9F6]/25 transition-all text-center"
              >
                <Mail className="w-4 h-4 text-white" />
                <span>Email Support Desk</span>
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* Interactive Support Complaint Form with File Uploader & History */}
      <section className="max-w-3xl mx-auto w-full bg-white border border-[#1A1A1A]/10 p-6 md:p-10 mb-16 relative">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#1A1A1A]/10">
          <div className="w-12 h-12 bg-[#FAF9F6] border border-[#D64545]/20 text-[#D64545] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-black text-2xl text-ink leading-tight">Raise a Complaint</h2>
            <p className="font-sans text-xs text-on-surface-variant/80">
              We take quality failures seriously. Submit details to get matched instantly with an inspector.
            </p>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Booking Reference Selection / Input */}
            <div className="space-y-2">
              <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink" htmlFor="booking_ref">
                Booking Reference <span className="text-[#D64545]">*</span>
              </label>
              <div className="relative">
                {bookings && bookings.length > 0 ? (
                  <select 
                    id="booking_ref"
                    className="w-full h-12 bg-[#FAF9F6] border border-[#1A1A1A]/10 px-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary appearance-none rounded-none cursor-pointer"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select your active job</option>
                    {bookings.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.id} - {b.serviceTitle} ({b.date})
                      </option>
                    ))}
                    <option value="NEW-PROJECT">Bespoke / No Active ID</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    id="booking_ref"
                    className="w-full h-12 bg-[#FAF9F6] border border-[#1A1A1A]/10 px-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                    placeholder="e.g. BKG-41902"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    required
                  />
                )}
                {bookings && bookings.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/50 font-serif font-bold text-xs">
                    ↓
                  </span>
                )}
              </div>
            </div>

            {/* Type of Issue */}
            <div className="space-y-2">
              <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink" htmlFor="issue_type">
                Type of Issue <span className="text-[#D64545]">*</span>
              </label>
              <div className="relative">
                <select
                  id="issue_type"
                  className="w-full h-12 bg-[#FAF9F6] border border-[#1A1A1A]/10 px-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary appearance-none rounded-none cursor-pointer"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  required
                >
                  <option value="" disabled>Select the issue profile...</option>
                  <option value="Service Quality Fail">Service Quality Failure</option>
                  <option value="Pro No-Show">Pro Employee No-Show</option>
                  <option value="Accidental Damage">Accidental Property Damage</option>
                  <option value="Billing Dispute">Billing & Card Dispute</option>
                  <option value="Other">Other Specific Incident</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/50 font-serif font-bold text-xs">
                  ↓
                </span>
              </div>
            </div>

          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink" htmlFor="description">
              Specific details of incident <span className="text-[#D64545]">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full bg-[#FAF9F6] border border-[#1A1A1A]/10 p-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none resize-y"
              placeholder="Provide exact details (e.g. 'Pro was scheduled for 10am but failed to check in on stepper, we noticed missing trim paint on left corner...')"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Drag & Drop File Upload Simulator */}
          <div className="space-y-2">
            <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink">
              Attachments / Photo Logs (Optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-none p-6 flex flex-col items-center justify-center transition-colors cursor-pointer text-center ${
                isDragging 
                  ? 'border-primary bg-[#1C2B24]/5' 
                  : 'border-[#1A1A1A]/10 bg-[#FAF9F6] hover:bg-[#1A1A1A]/5'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
            >
              <UploadCloud className="w-8 h-8 text-on-surface-variant/60 mb-2" />
              <p className="font-sans text-xs font-bold text-ink">
                Click to select files or drag photos here
              </p>
              <p className="font-sans text-[10px] text-on-surface-variant/60 mt-1">
                PNG, JPG, HEIC logs up to 10MB per image
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>

            {/* Uploaded Files Tracker */}
            {attachments.length > 0 && (
              <div className="mt-3 bg-[#FAF9F6] border border-[#1A1A1A]/10 p-3 space-y-2">
                <p className="font-sans text-[10px] uppercase tracking-wider font-bold text-ink">
                  Selected Evidence Files ({attachments.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white border border-[#1A1A1A]/15 px-3 py-1.5 flex items-center gap-2 text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono text-[10px] max-w-[150px] truncate text-ink">{file.name}</span>
                      <span className="font-sans text-[9px] text-on-surface-variant/60">({file.size})</span>
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                        className="text-[#D64545] hover:text-black ml-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-[#1A1A1A]/10">
            <button
              type="submit"
              className="bg-[#1A1A1A] hover:bg-black text-white font-sans font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-none transition-all cursor-pointer flex items-center gap-2 group"
            >
              <span>Submit Active Complaint</span>
              <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#FAF9F6]" />
            </button>
          </div>
        </form>

        {/* Complaint submitted feedback modal / block */}
        <AnimatePresence>
          {submitSuccess && submittedComplaint && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-[#FAF9F6] p-6 md:p-10 flex flex-col justify-center items-center text-center z-10"
            >
              <div className="w-16 h-16 bg-[#F6FFF8] border border-[#6B9080]/30 rounded-full flex items-center justify-center text-[#6B9080] mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <span className="bg-[#FAF9F6] text-primary border border-[#6B9080]/35 text-[9px] tracking-widest font-sans font-bold uppercase px-3 py-1 mb-3">
                Complaint Registered Successfully
              </span>
              <h3 className="font-serif text-3xl font-black text-ink mb-2">
                Ticket {submittedComplaint.id}
              </h3>
              <p className="font-sans text-xs text-on-surface-variant/80 max-w-md leading-relaxed mb-6">
                Your complaint has been successfully dispatched directly to Nestly's Senior Quality Inspectors. We have initialized investigations into booking reference <strong className="text-ink">{submittedComplaint.bookingRef}</strong>. Expect a coordinate response within 2 hours.
              </p>
              
              <div className="bg-white border border-[#1A1A1A]/10 p-4 max-w-md w-full text-left font-sans text-xs text-on-surface-variant space-y-2 mb-8">
                <p><strong>Submitted Date:</strong> {submittedComplaint.dateSubmitted}</p>
                <p><strong>Incident Category:</strong> {submittedComplaint.issueType}</p>
                <p><strong>Initial Ticket Status:</strong> <span className="bg-[#FAF9F6] text-[#F4A261] border border-[#F4A261]/20 px-1.5 py-0.5 uppercase font-bold text-[9px]">{submittedComplaint.status}</span></p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="bg-[#1A1A1A] hover:bg-black text-[#FAF9F6] font-sans font-bold text-[10px] uppercase tracking-wider px-6 py-3.5 rounded-none cursor-pointer"
                >
                  File Another Ticket
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Complaints Tracking List (If there are past filings) */}
      {complaints.length > 0 && (
        <section className="max-w-3xl mx-auto w-full mt-12 bg-[#FAF9F6] border border-[#1A1A1A]/15 p-6 rounded-none">
          <div className="flex justify-between items-center mb-4 border-b border-[#1A1A1A]/10 pb-2">
            <h3 className="text-[11px] uppercase tracking-widest font-sans font-bold text-ink">
              Your Open Support Tickets ({complaints.length})
            </h3>
            <button 
              onClick={() => {
                if (confirm('Clear all historical support tickets?')) {
                  setComplaints([]);
                  localStorage.removeItem('nestly_complaints');
                }
              }}
              className="text-[#D64545] text-[10px] uppercase tracking-wider font-bold hover:underline cursor-pointer"
            >
              Clear Ticket Log
            </button>
          </div>
          
          <div className="space-y-4">
            {complaints.map((cmp) => (
              <div key={cmp.id} className="bg-white border border-[#1A1A1A]/5 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="font-mono text-xs font-bold text-ink bg-[#FAF9F6] px-2 py-0.5 border border-[#1A1A1A]/10">
                      {cmp.id}
                    </span>
                    <span className="bg-[#FAF9F6] text-primary border border-primary/20 px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider">
                      {cmp.issueType}
                    </span>
                    <span className="font-sans text-[10px] text-on-surface-variant/60">
                      Filed: {cmp.dateSubmitted}
                    </span>
                  </div>
                  <p className="font-sans text-xs text-on-surface-variant/80 line-clamp-1">
                    Ref: <strong className="text-ink">{cmp.bookingRef}</strong> — {cmp.description}
                  </p>
                  {cmp.attachments.length > 0 && (
                    <p className="font-sans text-[9px] text-[#6B9080] font-bold mt-1">
                      ✓ {cmp.attachments.length} attachment logs uploaded
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 border-t md:border-t-0 border-[#1A1A1A]/5 pt-3 md:pt-0 shrink-0 justify-between md:justify-end">
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-widest text-on-surface-variant/60">Active Status</p>
                    <span className="bg-[#FFFDF6] text-[#FAF9F6] bg-[#1C2B24] border border-[#1C2B24]/10 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5">
                      {cmp.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Floating Live Chat Overlay Button & Chat Window */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.92 }}
              className="bg-white border-2 border-primary rounded-none shadow-[0_12px_40px_rgba(0,0,0,0.15)] w-[360px] h-[480px] flex flex-col mb-4 overflow-hidden"
            >
              {/* Chat Header */}
              <div className="bg-[#1C2B24] text-[#FAF9F6] p-4 flex justify-between items-center border-b border-[#1A1A1A]/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-white">Nestly Digital Concierge</h4>
                    <p className="font-sans text-[9px] text-[#FAF9F6]/75 uppercase tracking-wider">Operational Dispatch Desk</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="text-[#FAF9F6]/70 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-[#FAF9F6] space-y-4">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="font-sans text-[8px] text-on-surface-variant/50 mb-0.5 px-1">{msg.time}</span>
                    <div 
                      className={`max-w-[85%] px-3 py-2.5 text-xs leading-relaxed font-sans ${
                        msg.sender === 'user'
                          ? 'bg-[#1C2B24] text-white rounded-none border border-[#1C2B24]'
                          : 'bg-white text-ink rounded-none border border-[#1A1A1A]/10 shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#1A1A1A]/10 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask any question..."
                  className="flex-1 bg-[#FAF9F6] border border-[#1A1A1A]/10 px-3 py-2 text-xs font-sans focus:outline-none focus:border-primary rounded-none"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-primary hover:bg-[#1A1A1A] text-white p-2.5 rounded-none cursor-pointer flex items-center justify-center transition-colors shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer z-50 ${
            chatOpen 
              ? 'bg-[#D64545] text-white' 
              : 'bg-[#1C2B24] text-[#FAF9F6] hover:bg-black'
          }`}
          title="Open Premium Support Desk"
        >
          {chatOpen ? <X className="w-6 h-6 text-[#FAF9F6]" /> : <MessageSquare className="w-6 h-6 text-[#FAF9F6]" />}
        </button>
      </div>

    </div>
  );
}
