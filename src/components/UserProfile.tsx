/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  Lock,
  Shield,
  ChevronRight,
  Edit,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  LockKeyhole,
  Check,
  Eye,
  EyeOff,
  UserCheck,
  Info,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserProfileProps {
  userProfile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    zipCode: string;
    isCreated: boolean;
  };
  onSaveProfile: (profile: any) => void;
}

type ActiveSection = 'personal' | 'addresses' | 'payments' | 'notifications' | 'security' | 'privacy';

export default function UserProfile({ userProfile, onSaveProfile }: UserProfileProps) {
  const { logout, user } = useAuth();
  // Navigation
  const [activeSection, setActiveSection] = useState<ActiveSection>('personal');

  // Form States - Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPersonalSuccess, setShowPersonalSuccess] = useState(false);

  // Parse name on load
  useEffect(() => {
    const fullName = userProfile.name || 'Sarah Jenkins';
    const parts = fullName.split(' ');
    setFirstName(parts[0] || 'Sarah');
    setLastName(parts.slice(1).join(' ') || 'Jenkins');
    setEmail(userProfile.email || 'sarah.j@example.com');
    setPhone(userProfile.phone || '+1 (555) 123-4567');
  }, [userProfile]);

  // Saved Addresses (Persisted in localStorage)
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('nestly_saved_addresses');
    return saved ? JSON.parse(saved) : [
      { id: '1', label: 'Home (Default)', street: '124 Alpine Crest Dr', city: 'San Mateo', state: 'CA', zip: '94402' },
      { id: '2', label: 'Office', street: '555 Bryant St, Suite 200', city: 'Palo Alto', state: 'CA', zip: '94301' }
    ];
  });

  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressStreet, setNewAddressStreet] = useState('');
  const [newAddressCity, setNewAddressCity] = useState('');
  const [newAddressState, setNewAddressState] = useState('');
  const [newAddressZip, setNewAddressZip] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Saved Payment Methods (Persisted in localStorage)
  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('nestly_saved_payments');
    return saved ? JSON.parse(saved) : [
      { id: '1', brand: 'Visa', last4: '4242', exp: '12/28', isDefault: true, holder: 'Sarah Jenkins' },
      { id: '2', brand: 'Mastercard', last4: '8812', exp: '04/27', isDefault: false, holder: 'Sarah Jenkins' }
    ];
  });

  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExp, setNewCardExp] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('nestly_notifications_pref');
    return saved ? JSON.parse(saved) : {
      emailUpdates: true,
      smsDispatch: true,
      promotions: false,
      safetyAlerts: true
    };
  });

  // Security password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Privacy consents states
  const [shareData, setShareData] = useState(true);
  const [anonymousLogs, setAnonymousLogs] = useState(false);
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);

  // Persists
  useEffect(() => {
    localStorage.setItem('nestly_saved_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('nestly_saved_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('nestly_notifications_pref', JSON.stringify(notifications));
  }, [notifications]);

  // Handle personal info save
  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      alert('First Name, Last Name, and Email are required.');
      return;
    }

    const updatedProfile = {
      ...userProfile,
      name: `${firstName} ${lastName}`,
      email,
      phone,
      address: addresses[0]?.street || userProfile.address,
      zipCode: addresses[0]?.zip || userProfile.zipCode,
      isCreated: true
    };

    onSaveProfile(updatedProfile);
    setShowPersonalSuccess(true);
    setTimeout(() => {
      setShowPersonalSuccess(false);
    }, 4000);
  };

  // Add address handler
  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLabel || !newAddressStreet || !newAddressCity || !newAddressZip) {
      alert('Please fill out all required fields.');
      return;
    }

    const newAddr = {
      id: `${Date.now()}`,
      label: newAddressLabel,
      street: newAddressStreet,
      city: newAddressCity,
      state: newAddressState || 'CA',
      zip: newAddressZip
    };

    setAddresses(prev => [...prev, newAddr]);
    
    // Also sync to main profile if it was empty
    if (!userProfile.address) {
      onSaveProfile({
        ...userProfile,
        address: newAddressStreet,
        zipCode: newAddressZip
      });
    }

    // Reset Form
    setNewAddressLabel('');
    setNewAddressStreet('');
    setNewAddressCity('');
    setNewAddressState('');
    setNewAddressZip('');
    setIsAddingAddress(false);
  };

  // Delete Address
  const handleDeleteAddress = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    }
  };

  // Add credit card handler
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardHolder || !newCardExp || !newCardCvc) {
      alert('Please fill out all card details.');
      return;
    }

    const brand = newCardNumber.startsWith('5') ? 'Mastercard' : newCardNumber.startsWith('3') ? 'Amex' : 'Visa';
    const last4 = newCardNumber.replace(/\s?/g, '').slice(-4);

    const newCard = {
      id: `${Date.now()}`,
      brand,
      last4: last4 || '9912',
      exp: newCardExp,
      holder: newCardHolder,
      isDefault: payments.length === 0
    };

    setPayments(prev => [...prev, newCard]);

    // Reset Form
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExp('');
    setNewCardCvc('');
    setIsAddingPayment(false);
  };

  // Delete Payment Card
  const handleDeletePayment = (id: string) => {
    if (confirm('Are you sure you want to delete this payment card?')) {
      const cardToDelete = payments.find(p => p.id === id);
      const filtered = payments.filter(p => p.id !== id);
      if (cardToDelete?.isDefault && filtered.length > 0) {
        filtered[0].isDefault = true; // elect new default
      }
      setPayments(filtered);
    }
  };

  // Set card as default
  const handleSetDefaultCard = (id: string) => {
    setPayments(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === id
    })));
  };

  // Password change handler
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityMessage({ text: 'All password fields are required.', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityMessage({ text: 'New password and confirmation do not match.', type: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      setSecurityMessage({ text: 'New password must be at least 8 characters long.', type: 'error' });
      return;
    }

    setSecurityMessage({ text: 'Security credential updated successfully!', type: 'success' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      setSecurityMessage(null);
    }, 4000);
  };

  // Privacy Save Handler
  const handlePrivacySave = () => {
    setPrivacyMessage('Privacy settings updated and locked.');
    setTimeout(() => {
      setPrivacyMessage(null);
    }, 3000);
  };

  // Verify Phone
  const handleVerifyPhone = () => {
    setPhoneVerified(true);
    alert('Verification code sent! Phone number is now verified.');
  };

  // Side navigation helper
  const navItems = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield }
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
      
      {/* Page Title Header */}
      <div className="mb-12">
        <span className="bg-[#1C2B24] text-[#FAF9F6] px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-sans font-bold inline-block mb-3">
          SECURE CUSTOMER PANEL
        </span>
        <h1 className="font-serif text-3xl md:text-5xl font-black text-ink tracking-tight">
          Profile & Settings
        </h1>
        <p className="font-sans text-sm text-on-surface-variant/80 max-w-xl leading-relaxed mt-1">
          Manage your contact credentials, coordinate residential coordinates, save billing details, or set notifications.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Side Navigation Column */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="space-y-1 bg-[#FAF9F6] p-2 border border-[#1A1A1A]/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as ActiveSection)}
                  className={`w-full text-left px-4 py-3.5 flex items-center justify-between transition-all rounded-none cursor-pointer group ${
                    isActive
                      ? 'bg-[#1C2B24] text-[#FAF9F6] font-bold border-l-2 border-primary'
                      : 'text-on-surface-variant hover:bg-[#1A1A1A]/5 text-xs font-sans'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FAF9F6]' : 'text-on-surface-variant/75'}`} />
                    <span className="font-sans text-xs uppercase tracking-wider">{item.label}</span>
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isActive ? 'text-[#FAF9F6] opacity-100' : 'text-on-surface-variant/40'}`} />
                </button>
              );
            })}
            {user && (
              <button
                onClick={() => {
                  logout();
                  window.location.reload();
                }}
                className="w-full text-left px-4 py-3.5 flex items-center justify-between transition-all rounded-none cursor-pointer text-[#D64545] hover:bg-[#D64545]/10 text-xs font-sans mt-4 border-t border-[#1A1A1A]/10 pt-4"
              >
                <span className="flex items-center gap-3">
                  <LogOut className="w-4 h-4 text-[#D64545]" />
                  <span className="font-sans text-xs uppercase tracking-wider font-bold">Sign Out</span>
                </span>
              </button>
            )}
          </nav>
        </aside>

        {/* Dynamic settings container panel */}
        <div className="flex-grow bg-white border border-[#1A1A1A]/10 p-6 md:p-10 relative">
          
          <AnimatePresence mode="wait">
            
            {/* 1. PERSONAL INFO SECTION */}
            {activeSection === 'personal' && (
              <motion.div
                key="personal-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="border-b border-[#1A1A1A]/10 pb-4 flex justify-between items-center">
                  <h2 className="font-serif font-black text-xl md:text-2xl text-ink">Personal Information</h2>
                  <span className="text-[10px] font-sans text-on-surface-variant/50 uppercase tracking-widest font-bold">Step 1 of 6</span>
                </div>

                {/* Profile Photo Header Block */}
                <div className="flex items-center gap-6 pb-6 border-b border-[#1A1A1A]/5 bg-[#FAF9F6] p-4">
                  <div className="relative">
                    <img
                      className="w-20 h-20 rounded-none object-cover border border-[#1A1A1A]/10"
                      alt="Sarah Jenkins Profile"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUgN9RJB3bZh5_NgPzR7QCrcyno9dyPqWxGbENj3b2QKJwLidh0kRJ6decBwBJkOjtMOpsQQDC_mZdUUTQsfg-cWoJSAjnNBy9crrhuFZqQL7sVYOQWv6GuO3M2IcOOqDHANqg4BMU6hoPBCcaYDHEN2UEAz9kvyffa1bneD6w73nTxaigIzYZMU8cqzRDoVPcgm3Nyk7oX5fOQLUiCHHlxqAA2o4LRB61T2-ZwDz9m1B_lBmvXVJY"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      type="button" 
                      onClick={() => alert('Photo upload requires camera permission or direct image drop.')}
                      className="absolute -bottom-1.5 -right-1.5 bg-[#1C2B24] text-white p-1 border border-white hover:bg-black transition-transform duration-150 cursor-pointer"
                      title="Edit photo"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
                      <span>{firstName} {lastName}</span>
                      <span className="bg-[#E2F1ED] text-primary border border-primary/10 text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Premium Member
                      </span>
                    </h3>
                    <p className="font-sans text-xs text-on-surface-variant/75">Member ID: NST-2023-9941</p>
                    <p className="font-sans text-[10px] text-on-surface-variant/50 mt-1">Nestly Premium customer since October 2023</p>
                  </div>
                </div>

                <form onSubmit={handleSavePersonal} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink">
                        First Name <span className="text-[#D64545]">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full h-12 bg-[#FAF9F6] border border-[#1A1A1A]/10 px-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink">
                        Last Name <span className="text-[#D64545]">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full h-12 bg-[#FAF9F6] border border-[#1A1A1A]/10 px-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink">
                      Email Address <span className="text-[#D64545]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        className="w-full h-12 bg-[#FAF9F6] border border-[#1A1A1A]/10 pl-4 pr-12 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-[#4A7A74]" title="Email Verified">
                        <CheckCircle className="w-4 h-4 text-[#4A7A74]" />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink">
                      Mobile Phone <span className="text-[#D64545]">*</span>
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="tel"
                        className="flex-grow h-12 bg-[#FAF9F6] border border-[#1A1A1A]/10 px-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1 (555) 123-4567"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleVerifyPhone}
                        disabled={phoneVerified}
                        className={`px-5 h-12 font-sans font-bold text-[10px] uppercase tracking-widest transition-all rounded-none cursor-pointer shrink-0 ${
                          phoneVerified 
                            ? 'bg-[#F6FFF8] text-[#4A7A74] border border-[#6B9080]/30'
                            : 'bg-[#1C2B24] text-[#FAF9F6] hover:bg-black'
                        }`}
                      >
                        {phoneVerified ? 'Verified' : 'Verify SMS'}
                      </button>
                    </div>
                    {!phoneVerified && (
                      <p className="text-[10px] text-[#FAF9F6] bg-[#D64545] px-3 py-1 font-sans flex items-center gap-1.5 mt-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Verification required to receive on-route specialist dispatch alerts.
                      </p>
                    )}
                  </div>

                  {/* Success Alert Block */}
                  {showPersonalSuccess && (
                    <div className="p-4 bg-[#F6FFF8] border border-[#6B9080]/30 text-xs font-sans text-[#1C2B24] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#6B9080]" />
                      <span><strong>Changes Saved:</strong> Your profile credentials have been synchronized and written to secure disk records.</span>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#1A1A1A] hover:bg-black text-[#FAF9F6] font-sans font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-none transition-all cursor-pointer"
                    >
                      Save Account Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 2. SAVED ADDRESSES SECTION */}
            {activeSection === 'addresses' && (
              <motion.div
                key="saved-addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="border-b border-[#1A1A1A]/10 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-serif font-black text-xl md:text-2xl text-ink">Saved Addresses</h2>
                    <p className="font-sans text-xs text-on-surface-variant/80 mt-0.5">Specify locations where certified technicians will deliver catalog services.</p>
                  </div>
                  <span className="text-[10px] font-sans text-on-surface-variant/50 uppercase tracking-widest font-bold">Step 2 of 6</span>
                </div>

                {/* List of saved addresses */}
                <div className="space-y-4">
                  {addresses.map((addr: any, index: number) => (
                    <div
                      key={addr.id}
                      className="border border-[#1A1A1A]/10 p-5 flex justify-between items-start hover:border-primary transition-all duration-200 bg-[#FAF9F6]"
                    >
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-white border border-[#1A1A1A]/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4 text-[#1C2B24]" />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-ink flex items-center gap-2">
                            {addr.label}
                            {index === 0 && (
                              <span className="bg-[#1C2B24] text-white text-[7px] uppercase font-sans font-bold px-1.5 py-0.5">Primary</span>
                            )}
                          </h4>
                          <p className="font-sans text-xs text-on-surface-variant/80 mt-1">{addr.street}</p>
                          <p className="font-sans text-xs text-on-surface-variant/60">{addr.city}, {addr.state} {addr.zip}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-on-surface-variant/50 hover:text-[#D64545] p-1 cursor-pointer transition-colors"
                        title="Delete this address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {addresses.length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-[#1A1A1A]/10 font-sans text-xs text-on-surface-variant/60">
                      No saved addresses. Please add a residential coordinate below.
                    </div>
                  )}
                </div>

                {/* Form to add a new address */}
                {!isAddingAddress ? (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="w-full py-4 border border-dashed border-[#1A1A1A]/20 bg-transparent hover:bg-[#FAF9F6] font-sans font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 text-[#1C2B24] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add New Residential Address
                  </button>
                ) : (
                  <form onSubmit={handleAddAddress} className="bg-[#FAF9F6] border border-[#1A1A1A]/10 p-6 space-y-4">
                    <h3 className="font-serif font-bold text-sm text-ink mb-2">New Address Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block font-sans font-bold text-[9px] uppercase tracking-wider text-ink">Label (e.g. Home, Office, Beach House) *</label>
                        <input
                          type="text"
                          required
                          className="w-full h-10 bg-white border border-[#1A1A1A]/10 px-3 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                          value={newAddressLabel}
                          onChange={(e) => setNewAddressLabel(e.target.value)}
                          placeholder="e.g. Home"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-sans font-bold text-[9px] uppercase tracking-wider text-ink">Zip Code *</label>
                        <input
                          type="text"
                          required
                          className="w-full h-10 bg-white border border-[#1A1A1A]/10 px-3 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                          value={newAddressZip}
                          onChange={(e) => setNewAddressZip(e.target.value)}
                          placeholder="94025"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block font-sans font-bold text-[9px] uppercase tracking-wider text-ink">Street Address *</label>
                      <input
                        type="text"
                        required
                        className="w-full h-10 bg-white border border-[#1A1A1A]/10 px-3 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                        value={newAddressStreet}
                        onChange={(e) => setNewAddressStreet(e.target.value)}
                        placeholder="e.g. 124 Alpine Crest Dr"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-sans font-bold text-[9px] uppercase tracking-wider text-ink">City *</label>
                        <input
                          type="text"
                          required
                          className="w-full h-10 bg-white border border-[#1A1A1A]/10 px-3 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                          value={newAddressCity}
                          onChange={(e) => setNewAddressCity(e.target.value)}
                          placeholder="e.g. Palo Alto"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-sans font-bold text-[9px] uppercase tracking-wider text-ink">State</label>
                        <input
                          type="text"
                          className="w-full h-10 bg-white border border-[#1A1A1A]/10 px-3 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                          value={newAddressState}
                          onChange={(e) => setNewAddressState(e.target.value)}
                          placeholder="CA"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2 border border-[#1A1A1A]/10 text-xs font-sans font-bold uppercase tracking-wider hover:bg-white/50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#1C2B24] text-white px-5 py-2 text-xs font-sans font-bold uppercase tracking-widest hover:bg-black cursor-pointer"
                      >
                        Add Address
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* 3. PAYMENT METHODS SECTION */}
            {activeSection === 'payments' && (
              <motion.div
                key="payment-methods"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="border-b border-[#1A1A1A]/10 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-serif font-black text-xl md:text-2xl text-ink">Payment Methods</h2>
                    <p className="font-sans text-xs text-on-surface-variant/80 mt-0.5">Authorizations happen on booking. Payments captured ONLY upon certified job completion.</p>
                  </div>
                  <span className="text-[10px] font-sans text-on-surface-variant/50 uppercase tracking-widest font-bold">Step 3 of 6</span>
                </div>

                <div className="space-y-4">
                  {payments.map((card: any) => (
                    <div
                      key={card.id}
                      className={`border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-200 ${
                        card.isDefault ? 'border-primary bg-[#F6FFF8]' : 'border-[#1A1A1A]/10 bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-8 bg-[#1A1A1A] text-white flex items-center justify-center text-[10px] uppercase font-mono font-bold tracking-widest">
                          {card.brand}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-sm text-ink flex items-center gap-2">
                            •••• •••• •••• {card.last4}
                            {card.isDefault && (
                              <span className="bg-primary text-white text-[7px] uppercase font-sans font-bold px-1.5 py-0.5">Default Card</span>
                            )}
                          </p>
                          <p className="font-sans text-[10px] text-on-surface-variant/60 mt-1">
                            Expires {card.exp} • Holder: {card.holder}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto justify-end">
                        {!card.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultCard(card.id)}
                            className="text-xs font-sans text-[#1C2B24] font-bold hover:underline cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePayment(card.id)}
                          className="text-on-surface-variant/50 hover:text-[#D64545] p-1 cursor-pointer transition-colors"
                          title="Delete card file"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {!isAddingPayment ? (
                  <button
                    onClick={() => setIsAddingPayment(true)}
                    className="w-full py-4 border border-dashed border-[#1A1A1A]/20 bg-transparent hover:bg-[#FAF9F6] font-sans font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 text-[#1C2B24] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Register New Payment Card
                  </button>
                ) : (
                  <form onSubmit={handleAddPayment} className="bg-[#FAF9F6] border border-[#1A1A1A]/10 p-6 space-y-4">
                    <h3 className="font-serif font-bold text-sm text-ink mb-2">Card Credentials</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-sans font-bold text-[9px] uppercase tracking-wider text-ink">Card Holder Name *</label>
                        <input
                          type="text"
                          required
                          className="w-full h-10 bg-white border border-[#1A1A1A]/10 px-3 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                          value={newCardHolder}
                          onChange={(e) => setNewCardHolder(e.target.value)}
                          placeholder="Sarah Jenkins"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-sans font-bold text-[9px] uppercase tracking-wider text-ink">Card Number *</label>
                        <input
                          type="text"
                          required
                          className="w-full h-10 bg-white border border-[#1A1A1A]/10 px-3 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                          value={newCardNumber}
                          onChange={(e) => setNewCardNumber(e.target.value)}
                          placeholder="4111 2222 3333 4444"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block font-sans font-bold text-[9px] uppercase tracking-wider text-ink">Expiration Date (MM/YY) *</label>
                        <input
                          type="text"
                          required
                          className="w-full h-10 bg-white border border-[#1A1A1A]/10 px-3 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                          value={newCardExp}
                          onChange={(e) => setNewCardExp(e.target.value)}
                          placeholder="12/28"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block font-sans font-bold text-[9px] uppercase tracking-wider text-ink">CVV / CVC Secure Code *</label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          className="w-full h-10 bg-white border border-[#1A1A1A]/10 px-3 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                          value={newCardCvc}
                          onChange={(e) => setNewCardCvc(e.target.value)}
                          placeholder="•••"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingPayment(false)}
                        className="px-4 py-2 border border-[#1A1A1A]/10 text-xs font-sans font-bold uppercase tracking-wider hover:bg-white/50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#1C2B24] text-white px-5 py-2 text-xs font-sans font-bold uppercase tracking-widest hover:bg-black cursor-pointer"
                      >
                        Register Card
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* 4. NOTIFICATIONS PREFERENCES */}
            {activeSection === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="border-b border-[#1A1A1A]/10 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-serif font-black text-xl md:text-2xl text-ink">Notification Settings</h2>
                    <p className="font-sans text-xs text-on-surface-variant/80 mt-0.5">Control how and when our dispatch coordinators connect with you.</p>
                  </div>
                  <span className="text-[10px] font-sans text-on-surface-variant/50 uppercase tracking-widest font-bold">Step 4 of 6</span>
                </div>

                <div className="space-y-5 bg-[#FAF9F6] border border-[#1A1A1A]/10 p-6 md:p-8">
                  {/* Pref 1 */}
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4.5 w-4.5 text-primary border-[#1A1A1A]/20 focus:ring-primary rounded-none"
                      checked={notifications.emailUpdates}
                      onChange={(e) => setNotifications({ ...notifications, emailUpdates: e.target.checked })}
                    />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-ink leading-none">Email Receipts & Booking Invoices</h4>
                      <p className="font-sans text-xs text-on-surface-variant/80 mt-1.5 leading-relaxed">
                        Instantly receive dynamic itemized billing invoices, service verification logs, and satisfaction surveys.
                      </p>
                    </div>
                  </label>

                  {/* Pref 2 */}
                  <label className="flex items-start gap-4 cursor-pointer pt-4 border-t border-[#1A1A1A]/5">
                    <input
                      type="checkbox"
                      className="mt-1 h-4.5 w-4.5 text-primary border-[#1A1A1A]/20 focus:ring-primary rounded-none"
                      checked={notifications.smsDispatch}
                      onChange={(e) => setNotifications({ ...notifications, smsDispatch: e.target.checked })}
                    />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-ink leading-none">Specialist On-Route Text Messaging Alerts</h4>
                      <p className="font-sans text-xs text-on-surface-variant/80 mt-1.5 leading-relaxed">
                        Receive text messages with live route tracker coordinates when your assigned technician departs.
                      </p>
                    </div>
                  </label>

                  {/* Pref 3 */}
                  <label className="flex items-start gap-4 cursor-pointer pt-4 border-t border-[#1A1A1A]/5">
                    <input
                      type="checkbox"
                      className="mt-1 h-4.5 w-4.5 text-primary border-[#1A1A1A]/20 focus:ring-primary rounded-none"
                      checked={notifications.promotions}
                      onChange={(e) => setNotifications({ ...notifications, promotions: e.target.checked })}
                    />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-ink leading-none">Nestly Seasonal Announcements & Credit Offers</h4>
                      <p className="font-sans text-xs text-on-surface-variant/80 mt-1.5 leading-relaxed">
                        Opt in to receive customized discount codes, credits, and winterization/seasonal protocol announcements.
                      </p>
                    </div>
                  </label>

                  {/* Pref 4 */}
                  <label className="flex items-start gap-4 cursor-pointer pt-4 border-t border-[#1A1A1A]/5">
                    <input
                      type="checkbox"
                      className="mt-1 h-4.5 w-4.5 text-primary border-[#1A1A1A]/20 focus:ring-primary rounded-none"
                      checked={notifications.safetyAlerts}
                      onChange={(e) => setNotifications({ ...notifications, safetyAlerts: e.target.checked })}
                    />
                    <div>
                      <h4 className="font-serif font-bold text-sm text-ink leading-none">Emergency Service Triage Bulletins</h4>
                      <p className="font-sans text-xs text-on-surface-variant/80 mt-1.5 leading-relaxed">
                        Critical notices regarding regional storms, severe freezes, water warnings, or pro safety updates. Recommended.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#1A1A1A]/10">
                  <button
                    onClick={() => {
                      localStorage.setItem('nestly_notifications_pref', JSON.stringify(notifications));
                      alert('Notification metrics saved!');
                    }}
                    className="bg-[#1A1A1A] hover:bg-black text-[#FAF9F6] font-sans font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-none transition-all cursor-pointer"
                  >
                    Save Preference Rules
                  </button>
                </div>
              </motion.div>
            )}

            {/* 5. SECURITY SETTINGS */}
            {activeSection === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="border-b border-[#1A1A1A]/10 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-serif font-black text-xl md:text-2xl text-ink">Security Credentials</h2>
                    <p className="font-sans text-xs text-on-surface-variant/80 mt-0.5">Control secure login codes and verify multi-factor authorization tokens.</p>
                  </div>
                  <span className="text-[10px] font-sans text-on-surface-variant/50 uppercase tracking-widest font-bold">Step 5 of 6</span>
                </div>

                <div className="bg-[#FAF9F6] border border-[#1A1A1A]/10 p-5 font-sans text-xs text-on-surface-variant leading-relaxed flex items-center gap-3">
                  <LockKeyhole className="w-6 h-6 text-[#1C2B24] shrink-0" />
                  <div>
                    <strong className="text-ink">Two-Factor Authentication is Active:</strong> Every new browser log-in requires a secondary confirmation code dispatched to phone file +1 (•••) •••-4567.
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <h3 className="font-serif font-bold text-sm text-ink">Change Account Password</h3>

                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink">Current Secure Password *</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="w-full h-11 bg-[#FAF9F6] border border-[#1A1A1A]/10 px-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-ink cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink">New Secure Code (Min. 8 char) *</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="w-full h-11 bg-[#FAF9F6] border border-[#1A1A1A]/10 px-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-ink cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block font-sans font-bold text-[10px] uppercase tracking-wider text-ink">Confirm New Password *</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="w-full h-11 bg-[#FAF9F6] border border-[#1A1A1A]/10 px-4 font-sans text-xs text-on-surface focus:outline-none focus:border-primary rounded-none"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-ink cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {securityMessage && (
                    <div className={`p-4 text-xs font-sans flex items-center gap-2 ${
                      securityMessage.type === 'success' 
                        ? 'bg-[#F6FFF8] border border-[#6B9080]/30 text-[#1C2B24]' 
                        : 'bg-[#FFDAD6] border border-[#FFBAB5] text-[#93000A]'
                    }`}>
                      {securityMessage.type === 'success' ? <CheckCircle className="w-4 h-4 text-[#6B9080]" /> : <AlertTriangle className="w-4 h-4 text-[#93000A]" />}
                      <span>{securityMessage.text}</span>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#1A1A1A] hover:bg-black text-[#FAF9F6] font-sans font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-none transition-all cursor-pointer"
                    >
                      Update Password Code
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 6. PRIVACY & DATA SECTION */}
            {activeSection === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div className="border-b border-[#1A1A1A]/10 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-serif font-black text-xl md:text-2xl text-ink">Privacy & Data Controls</h2>
                    <p className="font-sans text-xs text-on-surface-variant/80 mt-0.5">Control how your personal credentials and diagnostic photos are utilized.</p>
                  </div>
                  <span className="text-[10px] font-sans text-on-surface-variant/50 uppercase tracking-widest font-bold">Step 6 of 6</span>
                </div>

                <div className="space-y-6">
                  {/* Option 1 */}
                  <div className="flex items-start justify-between gap-4 p-5 border border-[#1A1A1A]/10 bg-[#FAF9F6]">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-ink">Diagnostics Data & Photo Sharing</h4>
                      <p className="font-sans text-xs text-on-surface-variant/80 mt-1 leading-relaxed">
                        Allow certified Nestly technicians to save photo records of completed work for 12 months for compliance checks and quality reviews.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShareData(!shareData)}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${shareData ? 'bg-[#1C2B24]' : 'bg-[#1A1A1A]/10'}`}
                    >
                      <div className={`w-5 h-5 bg-white shadow-xs transform transition-transform duration-200 ${shareData ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Option 2 */}
                  <div className="flex items-start justify-between gap-4 p-5 border border-[#1A1A1A]/10 bg-[#FAF9F6]">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-ink">Anonymous System Performance Logs</h4>
                      <p className="font-sans text-xs text-on-surface-variant/80 mt-1 leading-relaxed">
                        Share anonymized scheduling timelines and route delay coordinates to optimize our regional dispatch routing AI.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAnonymousLogs(!anonymousLogs)}
                      className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${anonymousLogs ? 'bg-[#1C2B24]' : 'bg-[#1A1A1A]/10'}`}
                    >
                      <div className={`w-5 h-5 bg-white shadow-xs transform transition-transform duration-200 ${anonymousLogs ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Account Deletion */}
                  <div className="border border-[#FFBAB5] bg-[#FFDAD6] p-6 text-xs font-sans text-[#93000A] space-y-3">
                    <h4 className="font-serif font-bold text-sm text-[#93000A] flex items-center gap-1.5 leading-none">
                      <AlertTriangle className="w-4 h-4 text-[#93000A]" /> Decommission Nestly Account Record
                    </h4>
                    <p className="leading-relaxed">
                      Decommissioning your account will purge all saved addresses, billing credentials, and past repair histories permanently. This action cannot be reversed.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Permanently purge all data and delete account? This is irreversible.')) {
                          localStorage.clear();
                          alert('Account file and local caches successfully purged.');
                          window.location.reload();
                        }
                      }}
                      className="bg-[#D64545] hover:bg-red-700 text-white font-sans font-bold text-[9px] uppercase tracking-widest py-2.5 px-4 rounded-none transition-all cursor-pointer"
                    >
                      Purge & Delete All Data
                    </button>
                  </div>

                  {privacyMessage && (
                    <div className="p-4 bg-[#F6FFF8] border border-[#6B9080]/30 text-xs font-sans text-[#1C2B24] flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#6B9080]" />
                      <span>{privacyMessage}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-[#1A1A1A]/10">
                    <button
                      type="button"
                      onClick={handlePrivacySave}
                      className="bg-[#1A1A1A] hover:bg-black text-[#FAF9F6] font-sans font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-none transition-all cursor-pointer"
                    >
                      Save Privacy Rules
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
