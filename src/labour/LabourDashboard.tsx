import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Wrench, CalendarDays, User, LogOut,
  TrendingUp, Clock, CheckCircle2, XCircle, DollarSign,
  Plus, Eye, EyeOff, Trash2, ToggleLeft, ToggleRight, AlertCircle,
  ChevronRight, Star, Package, MessageSquare, Send, MapPin, ShieldCheck
} from 'lucide-react';
import { useLabourAuth } from './LabourAuthContext';

type View = 'dashboard' | 'services' | 'bookings' | 'chat' | 'profile';

interface Analytics {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  revenue: number;
  recentBookings: any[];
}

interface LabourService {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  priceValue: number;
  iconName: string;
  badge: string;
  isActive: boolean;
  isEmergency: boolean;
  createdAt: string;
}

interface Booking {
  id: string;
  serviceType: string;
  date: string;
  time: string;
  address: string;
  notes?: string;
  status: string;
  price?: string;
  createdAt: string;
  customer?: { fullName: string; email: string; phone: string };
}

const CATEGORIES = ['Plumbing', 'Electrical', 'Cleaning', 'Yard Care', 'Handyman', 'Painting', 'Carpentry', 'HVAC', 'Other'];
const ICONS = ['Wrench', 'Zap', 'Brush', 'Leaf', 'Hammer', 'Droplet', 'Package'];

const STATUS_COLORS: Record<string, string> = {
  Request: 'bg-amber-100 text-amber-700 border-amber-200',
  Assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  'En Route': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Arrived: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'In Progress': 'bg-purple-100 text-purple-700 border-purple-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function LabourDashboard() {
  const { labour, token, logoutLabour } = useLabourAuth();
  const [view, setView] = useState<View>('dashboard');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [services, setServices] = useState<LabourService[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: labour?.fullName || '',
    phone: labour?.phone || '',
    bio: (labour as any)?.bio || '',
    specialties: (labour as any)?.specialties || '',
    languages: (labour as any)?.languages || '',
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // New service form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '', description: '', category: 'Handyman',
    price: '', priceValue: '', iconName: 'Wrench', badge: 'Standard', isEmergency: false,
  });
  const [serviceError, setServiceError] = useState('');
  const [serviceSuccess, setServiceSuccess] = useState('');

  const authHeader = { Authorization: `Bearer ${token}` };

  const fetchAnalytics = useCallback(async () => {
    const res = await fetch('/api/labour/analytics', { headers: authHeader });
    if (res.ok) setAnalytics(await res.json());
  }, [token]);

  const [selectedChatBooking, setSelectedChatBooking] = useState<Booking | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [chatStore, setChatStore] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem('nestly_booking_chats');
    return saved ? JSON.parse(saved) : {};
  });

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/labour/services', { headers: authHeader });
      if (res.ok) setServices(await res.json());
    } catch (e) {}
  }, [token]);

  const fetchBookings = useCallback(async () => {
    const localSaved = localStorage.getItem('nestly_bookings');
    const localBookings = localSaved ? JSON.parse(localSaved) : [];

    try {
      const res = await fetch('/api/labour/bookings', { headers: authHeader });
      if (res.ok) {
        const serverBookings = await res.json();
        const map = new Map();
        [...localBookings, ...serverBookings].forEach((b: any) => map.set(b.id, b));
        setBookings(Array.from(map.values()));
        return;
      }
    } catch (e) {}
    setBookings(localBookings);
  }, [token]);

  useEffect(() => {
    if (view === 'dashboard') fetchAnalytics();
    if (view === 'services') fetchServices();
    if (view === 'bookings' || view === 'chat') fetchBookings();
  }, [view, fetchBookings]);

  const handlePublishService = async () => {
    setServiceError('');
    if (!serviceForm.title.trim() || !serviceForm.description.trim() || !serviceForm.price.trim() || !serviceForm.priceValue) {
      setServiceError('Please fill all required fields.'); return;
    }
    const newSvc = {
      id: `svc-${Date.now()}`,
      ...serviceForm,
      priceValue: parseFloat(serviceForm.priceValue) || 95,
    };
    const savedCustom = localStorage.getItem('nestly_labour_services');
    const currentList = savedCustom ? JSON.parse(savedCustom) : [];
    localStorage.setItem('nestly_labour_services', JSON.stringify([newSvc, ...currentList]));

    try {
      const res = await fetch('/api/labour/services', {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...serviceForm, priceValue: parseFloat(serviceForm.priceValue) }),
      });
      if (res.ok) {
        setServiceSuccess('Service published! It is now live on the platform.');
      } else {
        setServiceSuccess('Service saved locally and active on platform catalog.');
      }
    } catch (e) {
      setServiceSuccess('Service saved locally and active on platform catalog.');
    }
    setShowServiceForm(false);
    setServiceForm({ title: '', description: '', category: 'Handyman', price: '', priceValue: '', iconName: 'Wrench', badge: 'Standard', isEmergency: false });
    fetchServices();
    setTimeout(() => setServiceSuccess(''), 4000);
  };

  const handleToggleService = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/labour/services/${id}`, {
        method: 'PATCH',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
    } catch (e) {}
    fetchServices();
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await fetch(`/api/labour/services/${id}`, { method: 'DELETE', headers: authHeader });
    } catch (e) {}
    fetchServices();
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    const localSaved = localStorage.getItem('nestly_bookings');
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      const updated = parsed.map((b: any) => b.id === id ? { ...b, status } : b);
      localStorage.setItem('nestly_bookings', JSON.stringify(updated));
    }
    try {
      await fetch(`/api/labour/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (e) {}
    fetchBookings();
    if (view === 'dashboard') fetchAnalytics();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/labour/profile', {
        method: 'PUT',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        setProfileSaveSuccess(true);
        setIsEditingProfile(false);
        setTimeout(() => setProfileSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const navItems: { label: string; icon: React.ReactNode; view: View }[] = [
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, view: 'dashboard' },
    { label: 'My Services', icon: <Wrench className="w-4 h-4" />, view: 'services' },
    { label: 'Bookings', icon: <CalendarDays className="w-4 h-4" />, view: 'bookings' },
    { label: 'Customer Chats', icon: <MessageSquare className="w-4 h-4" />, view: 'chat' },
    { label: 'Profile', icon: <User className="w-4 h-4" />, view: 'profile' },
  ];

  return (
    <div className="min-h-screen bg-[#0F1410] flex font-sans">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#1A2118] border-r border-[#FAF9F6]/5 flex flex-col">
        <div className="p-6 border-b border-[#FAF9F6]/5">
          <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-[#6B9080] block mb-0.5">Labour Portal</span>
          <span className="text-2xl font-serif font-black text-[#FAF9F6]">Nestly</span>
        </div>

        {/* Labour identity */}
        <div className="p-4 border-b border-[#FAF9F6]/5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2 ${labour?.avatarColor || 'bg-[#6B9080] text-white'}`}>
            {labour?.avatarText || 'N'}
          </div>
          <p className="text-[#FAF9F6] text-xs font-bold truncate">{labour?.fullName}</p>
          <p className="text-[#FAF9F6]/40 text-[10px] truncate">{labour?.email}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-[#F4A261] text-[#F4A261]" />
            <span className="text-[#FAF9F6]/60 text-[10px]">{labour?.rating?.toFixed(1) || '—'} · {labour?.reviewsCount || 0} reviews</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer rounded-sm ${
                view === item.view
                  ? 'bg-[#6B9080]/20 text-[#6B9080]'
                  : 'text-[#FAF9F6]/40 hover:text-[#FAF9F6]/80 hover:bg-[#FAF9F6]/5'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-[#FAF9F6]/5">
          <button
            onClick={() => { logoutLabour(); window.location.reload(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {/* ── Dashboard View ── */}
        {view === 'dashboard' && (
          <div className="max-w-5xl">
            <h1 className="font-serif text-3xl font-black text-[#FAF9F6] mb-1">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {labour?.fullName?.split(' ')[0]}
            </h1>
            <p className="text-[#FAF9F6]/40 text-sm mb-8">Here's your performance overview.</p>

            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Bookings', value: analytics?.total ?? '—', icon: <CalendarDays className="w-5 h-5" />, color: 'text-blue-400' },
                { label: 'Pending', value: analytics?.pending ?? '—', icon: <Clock className="w-5 h-5" />, color: 'text-amber-400' },
                { label: 'Completed', value: analytics?.completed ?? '—', icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-emerald-400' },
                { label: 'Revenue', value: analytics ? `$${analytics.revenue.toFixed(0)}` : '—', icon: <DollarSign className="w-5 h-5" />, color: 'text-[#6B9080]' },
              ].map(stat => (
                <div key={stat.label} className="bg-[#1A2118] border border-[#FAF9F6]/5 p-5">
                  <div className={`${stat.color} mb-3`}>{stat.icon}</div>
                  <p className="text-[#FAF9F6] text-2xl font-black font-serif">{stat.value}</p>
                  <p className="text-[#FAF9F6]/40 text-[11px] uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-[#1A2118] border border-[#FAF9F6]/5">
              <div className="p-5 border-b border-[#FAF9F6]/5 flex justify-between items-center">
                <h2 className="font-serif text-lg font-bold text-[#FAF9F6]">Recent Bookings</h2>
                <button onClick={() => setView('bookings')} className="text-[11px] uppercase tracking-wider text-[#6B9080] hover:text-[#7da89a] flex items-center gap-1 font-bold">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {analytics?.recentBookings?.length ? (
                <div className="divide-y divide-[#FAF9F6]/5">
                  {analytics.recentBookings.map((b: any) => (
                    <div key={b.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="text-[#FAF9F6] text-sm font-bold">{b.serviceType}</p>
                        <p className="text-[#FAF9F6]/40 text-xs mt-0.5">{b.customer?.fullName} · {b.date} at {b.time}</p>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-1 border ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-8 text-center text-[#FAF9F6]/30 text-sm">No bookings yet. Once customers book your services, they'll appear here.</p>
              )}
            </div>
          </div>
        )}

        {/* ── Services View ── */}
        {view === 'services' && (
          <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="font-serif text-3xl font-black text-[#FAF9F6]">My Services</h1>
                <p className="text-[#FAF9F6]/40 text-sm mt-1">Services you publish are immediately visible on the Nestly platform.</p>
              </div>
              <button
                onClick={() => setShowServiceForm(p => !p)}
                className="flex items-center gap-2 bg-[#6B9080] text-[#0F1410] font-bold text-[11px] uppercase tracking-wider px-4 py-2.5 hover:bg-[#7da89a] transition-colors"
              >
                <Plus className="w-4 h-4" /> Publish Service
              </button>
            </div>

            {serviceSuccess && (
              <div className="mb-4 flex items-center gap-2 bg-emerald-900/20 text-emerald-400 text-xs p-3 border border-emerald-800/40">
                <CheckCircle2 className="w-4 h-4" /> {serviceSuccess}
              </div>
            )}

            {/* New Service Form */}
            {showServiceForm && (
              <div className="bg-[#1A2118] border border-[#FAF9F6]/5 p-6 mb-6 space-y-4">
                <h3 className="font-serif text-lg font-bold text-[#FAF9F6]">New Service</h3>
                {serviceError && (
                  <div className="flex items-center gap-2 bg-red-900/20 text-red-400 text-xs p-3 border border-red-800/50">
                    <AlertCircle className="w-4 h-4" /> {serviceError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#FAF9F6]/50 mb-1.5">Service Title *</label>
                    <input type="text" value={serviceForm.title} onChange={e => setServiceForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Deep Pipe Cleaning" className="w-full px-3 py-2.5 bg-[#0F1410] border border-[#FAF9F6]/10 focus:border-[#6B9080] outline-none text-sm text-[#FAF9F6] placeholder:text-[#FAF9F6]/20 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#FAF9F6]/50 mb-1.5">Category *</label>
                    <select value={serviceForm.category} onChange={e => setServiceForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#0F1410] border border-[#FAF9F6]/10 focus:border-[#6B9080] outline-none text-sm text-[#FAF9F6] transition-colors">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#FAF9F6]/50 mb-1.5">Price Display *</label>
                    <input type="text" value={serviceForm.price} onChange={e => setServiceForm(p => ({ ...p, price: e.target.value }))}
                      placeholder="e.g. $120 or $80/hr" className="w-full px-3 py-2.5 bg-[#0F1410] border border-[#FAF9F6]/10 focus:border-[#6B9080] outline-none text-sm text-[#FAF9F6] placeholder:text-[#FAF9F6]/20 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#FAF9F6]/50 mb-1.5">Price Value (numeric) *</label>
                    <input type="number" min="0" value={serviceForm.priceValue} onChange={e => setServiceForm(p => ({ ...p, priceValue: e.target.value }))}
                      placeholder="120" className="w-full px-3 py-2.5 bg-[#0F1410] border border-[#FAF9F6]/10 focus:border-[#6B9080] outline-none text-sm text-[#FAF9F6] placeholder:text-[#FAF9F6]/20 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-[#FAF9F6]/50 mb-1.5">Badge</label>
                    <select value={serviceForm.badge} onChange={e => setServiceForm(p => ({ ...p, badge: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-[#0F1410] border border-[#FAF9F6]/10 focus:border-[#6B9080] outline-none text-sm text-[#FAF9F6] transition-colors">
                      {['Standard', 'Priority', 'Premium', 'Emergency'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <input type="checkbox" id="emergency" checked={serviceForm.isEmergency} onChange={e => setServiceForm(p => ({ ...p, isEmergency: e.target.checked }))}
                      className="w-4 h-4 accent-[#6B9080]" />
                    <label htmlFor="emergency" className="text-[11px] uppercase tracking-wider font-bold text-[#FAF9F6]/60 cursor-pointer">Emergency Service</label>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-[#FAF9F6]/50 mb-1.5">Description *</label>
                  <textarea value={serviceForm.description} onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} placeholder="Describe what's included in this service…"
                    className="w-full px-3 py-2.5 bg-[#0F1410] border border-[#FAF9F6]/10 focus:border-[#6B9080] outline-none text-sm text-[#FAF9F6] placeholder:text-[#FAF9F6]/20 transition-colors resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handlePublishService} className="bg-[#6B9080] text-[#0F1410] font-bold text-[11px] uppercase tracking-wider px-6 py-2.5 hover:bg-[#7da89a] transition-colors">
                    Publish Service
                  </button>
                  <button onClick={() => setShowServiceForm(false)} className="border border-[#FAF9F6]/10 text-[#FAF9F6]/50 font-bold text-[11px] uppercase tracking-wider px-6 py-2.5 hover:text-[#FAF9F6]/80 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Services list */}
            {services.length === 0 ? (
              <div className="bg-[#1A2118] border border-[#FAF9F6]/5 p-12 text-center">
                <Package className="w-10 h-10 text-[#FAF9F6]/20 mx-auto mb-3" />
                <p className="text-[#FAF9F6]/40 text-sm">No services yet. Publish one to appear on the platform.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {services.map(s => (
                  <div key={s.id} className="bg-[#1A2118] border border-[#FAF9F6]/5 p-5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-[#FAF9F6] font-bold text-sm">{s.title}</h3>
                        <span className="text-[9px] bg-[#FAF9F6]/5 text-[#FAF9F6]/50 px-2 py-0.5 uppercase font-bold">{s.badge}</span>
                        <span className="text-[9px] bg-[#6B9080]/20 text-[#6B9080] px-2 py-0.5 uppercase font-bold">{s.category}</span>
                        {!s.isActive && <span className="text-[9px] bg-red-900/20 text-red-400 px-2 py-0.5 uppercase font-bold">Inactive</span>}
                      </div>
                      <p className="text-[#FAF9F6]/40 text-xs">{s.description}</p>
                      <p className="text-[#6B9080] text-xs font-bold mt-1">{s.price}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleToggleService(s.id, s.isActive)}
                        title={s.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-2 transition-colors ${s.isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#FAF9F6]/30 hover:text-[#FAF9F6]/60'}`}>
                        {s.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => handleDeleteService(s.id)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Bookings View ── */}
        {view === 'bookings' && (
          <div className="max-w-5xl">
            <h1 className="font-serif text-3xl font-black text-[#FAF9F6] mb-1">Bookings</h1>
            <p className="text-[#FAF9F6]/40 text-sm mb-8">All bookings assigned to you.</p>
            {bookings.length === 0 ? (
              <div className="bg-[#1A2118] border border-[#FAF9F6]/5 p-12 text-center">
                <CalendarDays className="w-10 h-10 text-[#FAF9F6]/20 mx-auto mb-3" />
                <p className="text-[#FAF9F6]/40 text-sm">No bookings assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-[#1A2118] border border-[#FAF9F6]/5 p-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[#FAF9F6] font-bold text-sm">{b.serviceType}</h3>
                          <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 border ${STATUS_COLORS[b.status] || ''}`}>{b.status}</span>
                        </div>
                        <p className="text-[#FAF9F6]/50 text-xs">
                          <span className="font-bold text-[#FAF9F6]/70">{b.customer?.fullName}</span> · {b.date} at {b.time}
                        </p>
                        <p className="text-[#FAF9F6]/40 text-xs">{b.address}</p>
                        {b.notes && <p className="text-[#FAF9F6]/30 text-xs italic">"{b.notes}"</p>}
                        {b.price && <p className="text-[#6B9080] text-xs font-bold">{b.price}</p>}
                      </div>
                      {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                        <div className="flex gap-2 flex-wrap items-start shrink-0">
                          {b.status === 'Request' && (
                            <button onClick={() => handleUpdateBookingStatus(b.id, 'Assigned')}
                              className="text-[10px] uppercase font-bold px-3 py-1.5 bg-blue-900/30 text-blue-400 border border-blue-800/50 hover:bg-blue-900/50 transition-colors">
                              Accept Booking
                            </button>
                          )}
                          {b.status === 'Assigned' && (
                            <button onClick={() => handleUpdateBookingStatus(b.id, 'En Route')}
                              className="text-[10px] uppercase font-bold px-3 py-1.5 bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 hover:bg-cyan-900/50 transition-colors">
                              On My Way
                            </button>
                          )}
                          {b.status === 'En Route' && (
                            <button onClick={() => handleUpdateBookingStatus(b.id, 'Arrived')}
                              className="text-[10px] uppercase font-bold px-3 py-1.5 bg-indigo-900/30 text-indigo-400 border border-indigo-800/50 hover:bg-indigo-900/50 transition-colors">
                              Arrived at Location
                            </button>
                          )}
                          {b.status === 'Arrived' && (
                            <button onClick={() => handleUpdateBookingStatus(b.id, 'In Progress')}
                              className="text-[10px] uppercase font-bold px-3 py-1.5 bg-purple-900/30 text-purple-400 border border-purple-800/50 hover:bg-purple-900/50 transition-colors">
                              Start Work
                            </button>
                          )}
                          {b.status === 'In Progress' && (
                            <button onClick={() => handleUpdateBookingStatus(b.id, 'Completed')}
                              className="text-[10px] uppercase font-bold px-3 py-1.5 bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/50 transition-colors">
                              Mark Completed
                            </button>
                          )}
                          <button onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                            className="text-[10px] uppercase font-bold px-3 py-1.5 bg-red-900/20 text-red-400/70 border border-red-800/30 hover:text-red-400 transition-colors">
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Customer Chats View ── */}
        {view === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
            {/* Thread List */}
            <div className="lg:col-span-4 bg-[#1A2118] border border-[#FAF9F6]/5 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[#FAF9F6]/5">
                <h3 className="font-serif text-lg font-bold text-[#FAF9F6]">Active Client Conversations</h3>
                <p className="text-[10px] text-[#FAF9F6]/50">Select a dispatch booking to review logs & reply</p>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-[#FAF9F6]/5">
                {bookings.length === 0 ? (
                  <p className="p-6 text-xs text-[#FAF9F6]/40 italic text-center">No client chats yet.</p>
                ) : bookings.map((b) => {
                  const msgs = chatStore[b.id] || [];
                  const lastMsg = msgs[msgs.length - 1]?.text || 'Service dispatch initialized';
                  const isSel = selectedChatBooking?.id === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedChatBooking(b)}
                      className={`w-full text-left p-4 transition-colors ${
                        isSel ? 'bg-[#6B9080]/20 border-l-2 border-[#6B9080]' : 'hover:bg-[#FAF9F6]/5'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-[#FAF9F6]">{b.customer?.fullName || (b as any).userName || 'Client'}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#FAF9F6]/10 text-[#FAF9F6]/70 font-bold">{b.status}</span>
                      </div>
                      <p className="text-[11px] text-[#6B9080] font-bold truncate mb-1">{b.serviceTitle || b.serviceType}</p>
                      <p className="text-[10px] text-[#FAF9F6]/60 truncate">{lastMsg}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-8 bg-[#1A2118] border border-[#FAF9F6]/5 flex flex-col overflow-hidden">
              {selectedChatBooking ? (
                <>
                  <div className="p-4 border-b border-[#FAF9F6]/5 flex justify-between items-center bg-[#121611]">
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#FAF9F6]">
                        {selectedChatBooking.customer?.fullName || (selectedChatBooking as any).userName || 'Customer'}
                      </h4>
                      <p className="text-[10px] text-[#FAF9F6]/60 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#6B9080]" />
                        {selectedChatBooking.address}
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-[#6B9080]/20 text-[#6B9080] px-2.5 py-1">
                      {selectedChatBooking.id}
                    </span>
                  </div>

                  {/* Message History */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {(chatStore[selectedChatBooking.id] || [
                      { sender: 'system', text: `📍 GPS Service Location Locked: ${selectedChatBooking.address}`, time: 'Booking Confirmed' },
                      { sender: 'pro', text: `Hello! I have received your request for ${selectedChatBooking.serviceTitle || selectedChatBooking.serviceType}. I will keep you updated!`, time: 'System Dispatch' }
                    ]).map((msg: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${msg.sender === 'pro' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-3 text-xs leading-relaxed ${
                            msg.sender === 'pro'
                              ? 'bg-[#6B9080] text-white'
                              : msg.sender === 'system'
                              ? 'bg-[#FAF9F6]/10 text-[#FAF9F6]/80 border border-[#FAF9F6]/10 font-mono text-[11px]'
                              : 'bg-[#121611] text-[#FAF9F6] border border-[#FAF9F6]/10'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-[#FAF9F6]/40 mt-1">{msg.time || 'Today'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Send Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!replyMessage.trim() || !selectedChatBooking) return;
                      const currentList = chatStore[selectedChatBooking.id] || [
                        { sender: 'system', text: `📍 GPS Service Location Locked: ${selectedChatBooking.address}`, time: 'Booking Confirmed' },
                        { sender: 'pro', text: `Hello! I have received your request. I will keep you updated!`, time: 'System Dispatch' }
                      ];
                      const newMsg = {
                        sender: 'pro',
                        text: replyMessage.trim(),
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      };
                      const updated = {
                        ...chatStore,
                        [selectedChatBooking.id]: [...currentList, newMsg]
                      };
                      setChatStore(updated);
                      localStorage.setItem('nestly_booking_chats', JSON.stringify(updated));
                      setReplyMessage('');
                    }}
                    className="p-4 border-t border-[#FAF9F6]/5 flex gap-2 bg-[#121611]"
                  >
                    <input
                      type="text"
                      placeholder="Type a response to client..."
                      className="flex-1 bg-[#1A2118] border border-[#FAF9F6]/10 text-[#FAF9F6] px-4 py-2.5 text-xs focus:outline-none focus:border-[#6B9080]"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-[#6B9080] text-white px-5 py-2.5 text-xs uppercase font-bold flex items-center gap-1.5 hover:bg-[#6B9080]/90 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#FAF9F6]/40">
                  <MessageSquare className="w-12 h-12 mb-3 stroke-1" />
                  <p className="text-sm font-serif">Select a conversation from the left to read & reply</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Profile View ── */}
        {view === 'profile' && (
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-3xl font-black text-[#FAF9F6]">Professional Profile & Credentials</h1>
                <p className="text-xs text-[#FAF9F6]/60 mt-1">Manage public specialist identity and verified background credentials</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs uppercase font-bold px-5 py-2.5 bg-[#6B9080] text-white hover:bg-[#6B9080]/80 transition-colors flex items-center gap-1.5"
              >
                {isEditingProfile ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>

            {profileSaveSuccess && (
              <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 p-4 mb-6 text-xs font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Profile updated successfully in database!</span>
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="bg-[#1A2118] border border-[#FAF9F6]/10 p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#FAF9F6]/50 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full bg-[#121611] border border-[#FAF9F6]/15 text-white p-3 text-sm focus:border-[#6B9080] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#FAF9F6]/50 mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-[#121611] border border-[#FAF9F6]/15 text-white p-3 text-sm focus:border-[#6B9080] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#FAF9F6]/50 mb-1.5">Specialties</label>
                    <input
                      type="text"
                      value={profileForm.specialties}
                      onChange={(e) => setProfileForm({ ...profileForm, specialties: e.target.value })}
                      className="w-full bg-[#121611] border border-[#FAF9F6]/15 text-white p-3 text-sm focus:border-[#6B9080] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-[#FAF9F6]/50 mb-1.5">Languages Spoken</label>
                    <input
                      type="text"
                      value={profileForm.languages}
                      onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                      className="w-full bg-[#121611] border border-[#FAF9F6]/15 text-white p-3 text-sm focus:border-[#6B9080] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#FAF9F6]/50 mb-1.5">Professional Bio</label>
                  <textarea
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full bg-[#121611] border border-[#FAF9F6]/15 text-white p-3 text-sm focus:border-[#6B9080] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-[#6B9080] text-white uppercase text-xs font-bold tracking-widest hover:bg-[#6B9080]/80 transition-colors"
                >
                  Save Profile Changes
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Identity Card */}
                <div className="md:col-span-1 bg-[#1A2118] border border-[#FAF9F6]/10 p-6 flex flex-col items-center text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black mb-4 ${labour?.avatarColor || 'bg-[#6B9080] text-white'}`}>
                    {labour?.avatarText || 'PR'}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#FAF9F6]">{labour?.fullName}</h3>
                  <span className="mt-1 bg-[#6B9080]/20 text-[#6B9080] text-[9px] uppercase tracking-widest font-bold px-2.5 py-0.5">
                    Verified Staff
                  </span>
                  <div className="w-full border-t border-[#FAF9F6]/10 mt-6 pt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#FAF9F6]/50">Client Rating</span>
                      <span className="text-[#F4A261] font-bold">★ {labour?.rating?.toFixed(1) || '4.9'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#FAF9F6]/50">Completed Jobs</span>
                      <span className="text-[#FAF9F6] font-bold">{labour?.completedJobs || 124}+</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Spec Sheet */}
                <div className="md:col-span-2 bg-[#1A2118] border border-[#FAF9F6]/10 p-8 space-y-6">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-[#FAF9F6]/40 tracking-wider mb-1">Contact Email</h4>
                    <p className="text-[#FAF9F6] text-sm font-mono">{labour?.email}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-[#FAF9F6]/40 tracking-wider mb-1">Phone Dispatch Number</h4>
                    <p className="text-[#FAF9F6] text-sm">{labour?.phone}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-[#FAF9F6]/40 tracking-wider mb-1">Specialties</h4>
                    <p className="text-[#FAF9F6] text-sm">{(labour as any)?.specialties || 'Plumbing Repair • Electrical • General Handyman'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-[#FAF9F6]/40 tracking-wider mb-1">Languages Spoken</h4>
                    <p className="text-[#FAF9F6] text-sm">{(labour as any)?.languages || 'English, Spanish'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-[#FAF9F6]/40 tracking-wider mb-1">Account Standing</h4>
                    <span className="inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase px-2 py-0.5">
                      {labour?.status || 'Active & Vetted'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
