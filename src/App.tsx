/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  CheckCircle,
  Shield,
  CreditCard,
  ArrowRight,
  Droplet,
  Zap,
  Leaf,
  Brush,
  Hammer,
  Sparkles,
  Calendar,
  Clock,
  Compass,
  Briefcase,
  HelpCircle,
  User,
  Info
} from 'lucide-react';

import Header from './components/Header';
import BookingModal from './components/BookingModal';
import StepperTracker from './components/StepperTracker';
import BookingsDashboard from './components/BookingsDashboard';
import Support from './components/Support';
import UserProfile from './components/UserProfile';
import Footer from './components/Footer';
import CustomerAccountBooking from './components/CustomerAccountBooking';
import ProProfileView from './components/ProProfileView';
import CustomEstimateCalculator from './components/CustomEstimateCalculator';
import CustomQuoteForm from './components/CustomQuoteForm';
import NestlyPrimeMembership from './components/NestlyPrimeMembership';

import { Service, Booking, BookingStatus } from './types';
import { SERVICES_CATALOG, POPULAR_CATEGORIES } from './data';
import { Star, ShieldCheck, Award, MessageSquare } from 'lucide-react';
import AuthModal from './components/AuthModal';

// ─── Bookings Auth Gate ────────────────────────────────────────────────────
function BookingsAuthGate({ onOpenAuth }: { onOpenAuth: () => void }) {
  const [modalOpen, setModalOpen] = React.useState(false);
  return (
    <div className="max-w-2xl mx-auto py-24 px-4 flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 bg-[#1C2B24]/5 border border-[#1C2B24]/20 flex items-center justify-center rounded-full">
        <User className="w-7 h-7 text-[#1C2B24]" />
      </div>
      <div className="space-y-2">
        <span className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-[#1A1A1A]/50 block">
          CUSTOMER PORTAL
        </span>
        <h2 className="font-serif text-4xl font-black text-[#1A1A1A] tracking-tight">
          Your Bookings
        </h2>
        <p className="font-sans text-sm text-[#1A1A1A]/60 leading-relaxed max-w-md mx-auto">
          Create a free Nestly account to track live dispatches, view booking history, reschedule services, and leave reviews for your pros.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-[#1C2B24] text-[#FAF9F6] font-sans font-bold text-[11px] uppercase tracking-widest px-8 py-3.5 hover:bg-[#2a3d30] transition-colors"
        >
          Create Free Account
        </button>
        <button
          onClick={() => setModalOpen(true)}
          className="border border-[#1A1A1A]/20 text-[#1A1A1A] font-sans font-bold text-[11px] uppercase tracking-widest px-8 py-3.5 hover:bg-[#1A1A1A]/5 transition-colors"
        >
          Sign In
        </button>
      </div>
      <div className="flex items-center gap-6 mt-2 text-[11px] font-sans text-[#1A1A1A]/40 uppercase tracking-wide">
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Secure & Private</span>
        <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> No spam ever</span>
      </div>
      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

export default function App() {

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'services' | 'bookings' | 'support' | 'profile' | 'pro-profile' | 'register-booking' | 'custom-quote'>('services');

  const { user, token } = useAuth();

  // Bookings — fetched from API when user is authenticated
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('nestly_bookings');
    return saved ? JSON.parse(saved) : [];
  });
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('nestly_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Data states (API-ready)
  const [servicesCatalog, setServicesCatalog] = useState<Service[]>(SERVICES_CATALOG);
  const [popularCategories, setPopularCategories] = useState(POPULAR_CATEGORIES);
  const [prosPool, setProsPool] = useState<any[]>([]);

  // Fetch catalogue data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, categoriesRes, labourRes] = await Promise.all([
          fetch('/api/data/services'),
          fetch('/api/data/categories'),
          fetch('/api/data/labour')
        ]);
        if (servicesRes.ok) setServicesCatalog(await servicesRes.json());
        if (categoriesRes.ok) setPopularCategories(await categoriesRes.json());
        if (labourRes.ok) setProsPool(await labourRes.json());
      } catch (err) {
        console.error('Failed to fetch data from API', err);
      }
    };
    fetchData();
  }, []);

  // Fetch bookings from API when user signs in
  const fetchBookings = useCallback(async () => {
    if (!token) return;
    setBookingsLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const apiBookings = await res.json();
        if (Array.isArray(apiBookings) && apiBookings.length > 0) {
          setBookings(apiBookings);
        }
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setBookingsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user, fetchBookings]);

  // Customer Profile state
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('nestly_customer_profile');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      phone: '',
      address: '',
      zipCode: '',
      isCreated: false
    };
  });

  // Sync customer profile directly from Database
  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setUserProfile({
            name: data.fullName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            zipCode: data.zipCode || '',
            isCreated: true
          });
        }
      })
      .catch(err => console.error('Failed to load DB profile:', err));
  }, [token]);

  const handleSaveProfile = async (newProfile: any) => {
    setUserProfile(newProfile);
    localStorage.setItem('nestly_customer_profile', JSON.stringify(newProfile));
    if (token) {
      try {
        await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: newProfile.name,
            phone: newProfile.phone,
            address: newProfile.address,
            zipCode: newProfile.zipCode,
          }),
        });
      } catch (err) {
        console.error('Failed to save profile to DB:', err);
      }
    }
  };

  // Track selected pro for profile viewing
  const [selectedProForProfile, setSelectedProForProfile] = useState<any | null>(null);
  const [selectedProForBooking, setSelectedProForBooking] = useState<any | null>(null);

  // Track the service preselected for registration and booking
  const [checkoutService, setCheckoutService] = useState<Service | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchZip, setSearchZip] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  // Booking Modal control
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);

  // Quick FAQ toggle state
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Active step in the landing page dynamic tracker simulator
  const [demoStatus, setDemoStatus] = useState<BookingStatus>('In Progress');

  // Counts of active bookings
  const activeBookingsCount = bookings.filter(
    (b) => b.status !== 'Completed' && b.status !== 'Cancelled'
  ).length;

  const handleBookService = (service: Service, pro?: any) => {
    setCheckoutService(service);
    setSelectedProForBooking(pro || null);
    setCurrentTab('register-booking');
  };

  const handleHeaderBookNow = () => {
    setCheckoutService(servicesCatalog[0] || SERVICES_CATALOG[0]);
    setSelectedProForBooking(null);
    setCurrentTab('register-booking');
  };

  const handleCreateBooking = async (newBooking: Booking) => {
    // 1. Immediately display in UI state
    setBookings((prev) => [newBooking, ...prev]);

    // 2. Persist to database if signed in
    if (token) {
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            serviceType: newBooking.serviceTitle || newBooking.serviceId || 'Home Specialist Booking',
            date: newBooking.date,
            time: newBooking.time,
            address: newBooking.address,
            notes: newBooking.notes,
            price: newBooking.price,
            priceValue: newBooking.priceValue,
            assignedProName: newBooking.assignedPro?.name,
            assignedProAvatar: newBooking.assignedPro?.avatarUrl,
            assignedProRating: newBooking.assignedPro?.rating,
            assignedProPhone: newBooking.assignedPro?.phone,
          }),
        });
        if (res.ok) {
          await fetchBookings();
        }
      } catch (err) {
        console.error('Failed to sync booking to server:', err);
      }
    }

    setTimeout(() => {
      setCurrentTab('bookings');
    }, 800);
  };

  const handleStatusChange = (id: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const handleReschedule = (id: string, date: string, time: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, date, time } : b))
    );
  };

  const handleCancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' as BookingStatus } : b))
    );
  };

  const handleResetAllBookings = () => {
    fetchBookings();
  };

  // Helper to map icon names from string to Lucide React component
  const renderServiceIcon = (iconName: string, colorClass = 'text-primary') => {
    const props = { className: `w-5 h-5 ${colorClass}` };
    switch (iconName) {
      case 'Droplet':
        return <Droplet {...props} />;
      case 'Zap':
        return <Zap {...props} />;
      case 'Leaf':
        return <Leaf {...props} />;
      case 'Brush':
        return <Brush {...props} />;
      case 'Hammer':
        return <Hammer {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  // Helper for Bento icons
  const renderBentoIcon = (iconName: string, colorClass = 'text-primary') => {
    const props = { className: `${colorClass} w-6 h-6 group-hover:scale-110 transition-transform` };
    switch (iconName) {
      case 'Brush':
        return <Brush {...props} />;
      case 'Wrench':
        return <Droplet {...props} />;
      case 'Bolt':
        return <Zap {...props} />;
      case 'Hammer':
        return <Hammer {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  // Filter service catalog
  const filteredServices = SERVICES_CATALOG.filter((s) => {
    const matchesCategory = selectedCategory
      ? s.category.toLowerCase() === selectedCategory.toLowerCase()
      : true;
    const matchesSearch = searchQuery
      ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const handleFindHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catalogElement = document.getElementById('catalog-section');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7faf8] text-[#181c1b] font-sans flex flex-col justify-between selection:bg-mint-cream selection:text-primary">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onBookNowClick={handleHeaderBookNow}
        activeBookingsCount={activeBookingsCount}
      />

      {/* Main Content Area */}
      <main className="flex-grow pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          {currentTab === 'services' && (
            <motion.div
              key="services-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <section className="relative w-full border-b border-[#1A1A1A]/10 pt-20 pb-24 px-4 md:px-8 overflow-hidden bg-[#FAF9F6]">
                {/* Background Video (WebM & MP4 fallback) */}
                <div className="absolute inset-0 z-0">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-[0.07] filter grayscale"
                  >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-carpenter-working-with-a-drill-41615-large.webm" type="video/webm" />
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-painter-painting-a-wall-with-a-roller-brush-40114-large.webm" type="video/webm" />
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-carpenter-working-with-a-drill-41615-large.mp4" type="video/mp4" />
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-painter-painting-a-wall-with-a-roller-brush-40114-large.mp4" type="video/mp4" />
                  </video>
                  {/* Soft overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FAF9F6]/10 to-[#FAF9F6]"></div>
                </div>

                <div className="relative z-10 max-w-[1200px] mx-auto text-center">
                  <span className="bg-[#1A1A1A] text-[#FAF9F6] px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-sans font-bold inline-block mb-4">
                    ESTABLISHED MMXXVI — TOKYO & LONDON
                  </span>
                  <h1 className="font-serif text-5xl md:text-7xl font-black text-ink mb-6 tracking-tighter max-w-3xl mx-auto leading-[0.95]">
                    Book trusted help, <br/><span className="italic font-light">today.</span>
                  </h1>
                  <p className="font-sans text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed opacity-80">
                    Enter your location, select a time, and we'll dispatch an internal, fully vetted Nestly professional. Managed household care, designed with ultimate precision.
                  </p>

                  {/* Labour Services Buttons */}
                  <div className="max-w-4xl mx-auto mb-6">
                    <p className="font-sans text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold mb-4 text-center">
                      Select an active dispatch specialty below to plan your estimate & hire
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'plumbing', label: 'Plumbing Repair', pro: 'Marcus Vance', icon: Droplet, query: 'plumbing', color: 'border-[#1C2B24]/10 hover:border-[#1C2B24]/40 hover:bg-[#1C2B24]/5' },
                        { id: 'electrical', label: 'Electrical Fixes', pro: 'Devon Carter', icon: Zap, query: 'electrical', color: 'border-[#1C2B24]/10 hover:border-[#1C2B24]/40 hover:bg-[#1C2B24]/5' },
                        { id: 'cleaning', label: 'Deep Cleaning', pro: 'Elena Rostova', icon: Brush, query: 'cleaning', color: 'border-[#1C2B24]/10 hover:border-[#1C2B24]/40 hover:bg-[#1C2B24]/5' },
                        { id: 'handyman', label: 'General Handyman', pro: 'Sasha Mendoza', icon: Hammer, query: 'handyman', color: 'border-[#1C2B24]/10 hover:border-[#1C2B24]/40 hover:bg-[#1C2B24]/5' },
                      ].map((service) => {
                        const Icon = service.icon;
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => {
                              setSearchQuery(service.query);
                              // Scroll to dynamic estimator section
                              const catalogElement = document.getElementById('catalog-section');
                              if (catalogElement) {
                                catalogElement.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className={`flex flex-col items-center p-4 bg-white border rounded-none transition-all duration-200 cursor-pointer text-ink group hover:shadow-sm ${service.color}`}
                          >
                            <div className="w-8 h-8 rounded-none bg-[#FAF9F6] border border-[#1A1A1A]/5 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                              <Icon className="w-4 h-4 text-[#1C2B24]" />
                            </div>
                            <span className="font-sans text-[11px] uppercase tracking-wider font-bold text-[#1A1A1A]">
                              {service.label}
                            </span>
                            <span className="font-serif text-[10px] text-on-surface-variant/60 mt-1 italic">
                              Specialist: {service.pro}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Quote callout in Hero */}
                  <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 bg-[#1C2B24]/5 border border-[#1C2B24]/10 max-w-2xl mx-auto py-3.5 px-6">
                    <p className="font-sans text-xs text-on-surface-variant/80">
                      Need a completely custom, specialized, or personal household task?
                    </p>
                    <button
                      type="button"
                      onClick={() => setCurrentTab('custom-quote')}
                      className="text-xs font-sans font-bold uppercase tracking-widest text-[#1C2B24] hover:text-[#6B9080] border-b border-[#1C2B24] pb-0.5 transition-colors cursor-pointer"
                    >
                      Request a Custom Quote &rarr;
                    </button>
                  </div>

                  {/* Trust Factors */}
                  <div className="flex flex-wrap justify-center gap-6 mt-12 text-[10px] uppercase tracking-widest font-sans font-bold text-on-surface-variant/80">
                    <div className="flex items-center gap-2 border-r border-[#1A1A1A]/10 pr-6 last:border-0">
                      <CheckCircle className="w-4 h-4 text-[#1A1A1A]/70" />
                      <span>100% Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2 border-r border-[#1A1A1A]/10 pr-6 last:border-0">
                      <Shield className="w-4 h-4 text-[#1A1A1A]/70" />
                      <span>Background Checked</span>
                    </div>
                    <div className="flex items-center gap-2 last:border-0">
                      <CreditCard className="w-4 h-4 text-[#1A1A1A]/70" />
                      <span>Transparent Pricing</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Our Trusted Workers - Premium Labours Section */}
              <section className="py-16 px-4 md:px-8 bg-background border-b border-[#1A1A1A]/10">
                <div className="max-w-[1200px] mx-auto">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                    <div>
                      <span className="text-[9px] uppercase tracking-[0.25em] font-sans font-bold opacity-60 block mb-2">
                        EXPERT HAND-PICKED STAFF
                      </span>
                      <h2 className="font-serif text-4xl font-black text-ink tracking-tight mb-2">
                        Our Trusted Workers
                      </h2>
                      <p className="font-sans text-sm text-on-surface-variant/80">
                        Rigorous vetting. Zero-tolerance background screens. Voted 4.9+ out of 5 stars by actual Nestly clients.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {prosPool.length === 0 ? (
                      <div className="col-span-4 text-center py-12 text-on-surface-variant/50 font-sans text-sm">
                        Our seller network is growing. Be the first to{' '}
                        <span className="font-bold text-[#1C2B24] cursor-pointer">become a seller!</span>
                      </div>
                    ) : prosPool.map((pro) => (
                      <div
                        key={pro.id}
                        onClick={() => {
                          setSelectedProForProfile(pro);
                          setCurrentTab('pro-profile');
                        }}
                        className="bg-white border border-[#1A1A1A]/10 p-6 flex flex-col justify-between relative group hover:border-[#1C2B24] transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-1 cursor-pointer"
                      >
                        {/* Premium Solid Accent Top Bar */}
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-[#6B9080]/20 group-hover:bg-[#1C2B24] transition-colors duration-300" />

                        {/* Elegant Verified Badge */}
                        <div className="absolute top-4 right-4 bg-[#F6FFF8] border border-[#6B9080]/30 text-[#1C2B24] font-semibold text-[7.5px] uppercase tracking-[0.18em] px-2 py-0.5 flex items-center gap-1 shadow-xs">
                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping shrink-0"></span>
                          <span>⭐ Premium Staff</span>
                        </div>

                        <div className="mt-2">
                          {/* Perfect Avatar Circle with Soft Dual Ring */}
                          <div className="relative inline-block mb-4">
                            <div className={`w-14 h-14 rounded-full ${pro.avatarColor} flex items-center justify-center font-sans font-black text-sm tracking-wide shadow-sm border-2 border-white ring-4 ring-[#6B9080]/15`}>
                              {pro.avatarText}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1C2B24] rounded-full border-2 border-white flex items-center justify-center text-[8px] text-[#FAF9F6] font-bold z-10 shadow-xs" title="100% Fully Vetted & Background Screened">
                              ✓
                            </span>
                          </div>

                          {/* Profile Header Details */}
                          <div className="mb-2.5">
                            <h3 className="font-serif font-black text-lg text-ink group-hover:text-[#1C2B24] transition-colors leading-tight">
                              {pro.name}
                            </h3>
                            <p className="font-mono text-[8px] text-on-surface-variant/50 uppercase tracking-widest mt-0.5">
                              LICENSED ID: VET-0{pro.experienceYears}{pro.avatarText}
                            </p>
                          </div>

                          {/* Refined Ratings Score Container */}
                          <div className="flex items-center gap-1.5 mb-4 bg-[#FAF9F6] border border-[#1A1A1A]/5 px-2.5 py-1 inline-flex rounded-xs">
                            <Star className="w-3 h-3 fill-[#F4A261] text-[#F4A261]" />
                            <span className="font-sans text-[11px] font-black text-ink">{pro.rating}</span>
                            <span className="text-on-surface-variant/30 text-[10px] select-none">|</span>
                            <span className="text-on-surface-variant/70 text-[9px] font-bold">({pro.reviewsCount} verified reviews)</span>
                          </div>

                          {/* Mini Stats Row */}
                          <div className="grid grid-cols-2 gap-2 border-t border-b border-[#1A1A1A]/5 py-2.5 mb-5 bg-[#FAF9F6]/40">
                            <div>
                              <p className="font-sans text-[7.5px] uppercase tracking-wider text-on-surface-variant/50 font-bold">Vetted Period</p>
                              <p className="font-serif text-[11.5px] font-black text-ink">{pro.experienceYears} Years Exp</p>
                            </div>
                            <div>
                              <p className="font-sans text-[7.5px] uppercase tracking-wider text-on-surface-variant/50 font-bold">Total Dispatches</p>
                              <p className="font-serif text-[11.5px] font-black text-ink">{pro.completedJobs}+ Completed</p>
                            </div>
                          </div>

                          {/* Specialty Badges list */}
                          <div className="space-y-1 mb-5">
                            <p className="text-[8px] uppercase tracking-[0.15em] font-sans font-extrabold text-[#1A1A1A]/40">
                              Core Specializations
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {pro.specialties.slice(0, 3).map((spec, sidx) => (
                                <span
                                  key={sidx}
                                  className="bg-[#FAF9F6] text-ink/85 border border-[#1C2B24]/10 px-2 py-0.5 text-[8.5px] font-sans font-bold uppercase tracking-wider"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedProForProfile(pro);
                            setCurrentTab('pro-profile');
                          }}
                          className="w-full text-center bg-[#1C2B24] text-white font-sans font-bold text-[9px] uppercase tracking-widest py-3 rounded-none hover:bg-[#6B9080] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 group/btn"
                        >
                          <span>View Profile & Reviews</span>
                          <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              </section>

              {/* Nestly Prime Priority Membership Benefits & Comparison */}
              <NestlyPrimeMembership />

              {/* Custom Estimate Calculator & Labour Dispatch Engine */}
              <div id="catalog-section">
                <CustomEstimateCalculator
                  onBookService={handleBookService}
                  initialQuery={searchQuery}
                />
              </div>

              {/* Custom Studio Section */}
              <section className="py-20 px-4 md:px-8 bg-white border-t border-[#1A1A1A]/10">
                <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7">
                    <span className="bg-[#1C2B24] text-[#FAF9F6] text-[9px] uppercase tracking-[0.2em] font-sans font-bold px-3 py-1 inline-block mb-3">
                      BESPOKE HOUSEHOLD PROJECTS
                    </span>
                    <h2 className="font-serif text-3xl md:text-5xl font-black text-[#1A1A1A] tracking-tight mb-4">
                      Need personal, tailored work? <br/>Get a custom estimate.
                    </h2>
                    <p className="font-sans text-sm text-on-surface-variant/80 leading-relaxed max-w-2xl">
                      Can't find your specific task in our standard catalog? From custom woodwork and intricate light wiring to bespoke estate cleanups or odd jobs, our certified, on-staff specialists handle personalized household requests with pristine reliability.
                    </p>
                  </div>
                  <div className="lg:col-span-5 flex flex-col justify-center items-start lg:items-end">
                    <div className="bg-[#FAF9F6] border border-[#1A1A1A]/10 p-6 w-full mb-4">
                      <h3 className="font-serif font-bold text-sm text-[#1A1A1A] mb-2">How it works:</h3>
                      <ul className="space-y-2 text-xs font-sans text-on-surface-variant/80">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#6B9080] shrink-0" />
                          <span>Define your custom requirements in details</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#6B9080] shrink-0" />
                          <span>Get matched instantly with a certified expert</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#6B9080] shrink-0" />
                          <span>Direct-message to align details and lock rate</span>
                        </li>
                      </ul>
                    </div>
                    <button
                      onClick={() => setCurrentTab('custom-quote')}
                      className="w-full bg-[#1A1A1A] hover:bg-[#1C2B24] text-[#FAF9F6] font-sans font-bold text-xs uppercase tracking-widest py-4 rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 group"
                    >
                      <span>Request Custom Quote</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="py-20 px-4 md:px-8 bg-background border-t border-[#1A1A1A]/10">
                <div className="max-w-2xl mx-auto">
                  <span className="text-[9px] uppercase tracking-[0.25em] font-sans font-bold opacity-60 block text-center mb-2">Queries & Clarifications</span>
                  <h3 className="font-serif text-3xl font-black text-center text-ink mb-10 tracking-tight">Frequently Asked Questions</h3>
                  <div className="space-y-0 border-t border-[#1A1A1A]/10">
                    {[
                      {
                        q: 'How does Nestly assign professionals?',
                        a: 'Nestly operates as a managed platform. Instead of letting random gig-workers bid, we centrally vet, employ, and background check our internal team. When you request a job, we match you with the best specialist certified for that specific repair type.',
                      },
                      {
                        q: 'Can I cancel or reschedule my booking?',
                        a: 'Absolutely! You can easily reschedule or cancel any active booking directly from your "My Bookings" dashboard. There are no fees for changes made up to 24 hours before your scheduled window.',
                      },
                      {
                        q: 'Are parts included in the pricing estimates?',
                        a: 'Standard estimated pricing covers certified labor and standard diagnostic tools. Raw replacement parts (like a specific kitchen faucet or lighting fixture of your choice) are typically provided by you, or billed transparently if our Pro source them for you.',
                      },
                    ].map((faq, idx) => (
                      <div key={idx} className="border-b border-[#1A1A1A]/10 rounded-none overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                          className="w-full text-left py-5 bg-transparent hover:bg-[#1A1A1A]/5 transition-all font-sans font-bold text-sm text-ink flex justify-between items-center cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <span className="text-primary text-md">{faqOpen === idx ? '−' : '+'}</span>
                        </button>
                        {faqOpen === idx && (
                          <div className="pb-5 pt-2 bg-transparent text-xs leading-relaxed text-on-surface-variant/80 border-t border-transparent animate-fade-in">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {currentTab === 'bookings' && (
            <motion.div
              key="bookings-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {user ? (
                bookingsLoading ? (
                  <div className="flex items-center justify-center py-32">
                    <div className="w-8 h-8 border-2 border-[#1C2B24]/20 border-t-[#1C2B24] rounded-full animate-spin" />
                  </div>
                ) : (
                  <BookingsDashboard
                    bookings={bookings}
                    onStatusChange={handleStatusChange}
                    onReschedule={handleReschedule}
                    onCancel={handleCancelBooking}
                    onBookNowClick={handleHeaderBookNow}
                  />
                )
              ) : (
                <BookingsAuthGate onOpenAuth={() => setCurrentTab('services')} />
              )}
            </motion.div>
          )}

          {currentTab === 'support' && (
            <motion.div
              key="support-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Support
                bookings={bookings}
              />
            </motion.div>
          )}

          {currentTab === 'pro-profile' && selectedProForProfile && (
            <motion.div
              key="pro-profile-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <ProProfileView
                pro={selectedProForProfile}
                onBack={() => setCurrentTab('services')}
                onBookService={(service) => {
                  setCheckoutService(service);
                  setSelectedProForBooking(selectedProForProfile);
                  setCurrentTab('register-booking');
                }}
              />
            </motion.div>
          )}

          {currentTab === 'profile' && (
            <motion.div
              key="user-profile-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <UserProfile
                userProfile={userProfile}
                onSaveProfile={handleSaveProfile}
              />
            </motion.div>
          )}

          {currentTab === 'register-booking' && checkoutService && (
            <motion.div
              key="register-booking-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <CustomerAccountBooking
                selectedService={checkoutService}
                selectedPro={selectedProForBooking}
                userProfile={userProfile}
                onSaveProfile={(prof) => handleSaveProfile({ ...prof, isCreated: true })}
                onConfirmBooking={handleCreateBooking}
                onCancel={() => setCurrentTab('services')}
              />
            </motion.div>
          )}

          {currentTab === 'custom-quote' && (
            <motion.div
              key="custom-quote-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <CustomQuoteForm
                userProfile={userProfile}
                onSaveProfile={(prof) => handleSaveProfile({ ...prof, isCreated: true })}
                onConfirmBooking={handleCreateBooking}
                onCancel={() => setCurrentTab('services')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onNavClick={(tab) => setCurrentTab(tab)} />

      {/* Bottom Nav Bar (Mobile-only floating navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-5 pt-2 bg-[#FAF9F6] border-t border-[#1A1A1A]/15 shadow-none">
        <button
          onClick={() => setCurrentTab('services')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-none transition-all duration-200 cursor-pointer ${
            currentTab === 'services'
              ? 'bg-[#1A1A1A] text-[#FAF9F6] font-bold'
              : 'text-on-surface-variant hover:bg-[#1A1A1A]/5'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="font-sans text-[10px] mt-1">Explore</span>
        </button>

        <button
          onClick={() => setCurrentTab('bookings')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-none transition-all duration-200 relative cursor-pointer ${
            currentTab === 'bookings'
              ? 'bg-[#1A1A1A] text-[#FAF9F6] font-bold'
              : 'text-on-surface-variant hover:bg-[#1A1A1A]/5'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          {activeBookingsCount > 0 && (
            <span className="absolute top-1 right-2 bg-[#9C2C2C] text-[#FAF9F6] text-[9px] px-1 rounded-full font-bold">
              {activeBookingsCount}
            </span>
          )}
          <span className="font-sans text-[10px] mt-1">Bookings</span>
        </button>

        <button
          onClick={() => setCurrentTab('support')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-none transition-all duration-200 cursor-pointer ${
            currentTab === 'support'
              ? 'bg-[#1A1A1A] text-[#FAF9F6] font-bold'
              : 'text-on-surface-variant hover:bg-[#1A1A1A]/5'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-sans text-[10px] mt-1">Support</span>
        </button>

        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-none transition-all duration-200 cursor-pointer ${
            currentTab === 'profile'
              ? 'bg-[#1A1A1A] text-[#FAF9F6] font-bold'
              : 'text-on-surface-variant hover:bg-[#1A1A1A]/5'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="font-sans text-[10px] mt-1">Profile</span>
        </button>
      </nav>

      {/* Scheduling Booking Modal Overlay */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedService={preselectedService}
        onBook={handleCreateBooking}
      />
    </div>
  );
}
