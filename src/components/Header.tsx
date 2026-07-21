/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Bell, Menu, User, LogIn, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import SellerApplicationModal from './SellerApplicationModal';

interface HeaderProps {
  currentTab: 'services' | 'bookings' | 'support' | 'profile' | 'pro-profile' | 'register-booking' | 'custom-quote';
  setCurrentTab: (tab: 'services' | 'bookings' | 'support' | 'profile' | 'pro-profile' | 'register-booking' | 'custom-quote') => void;
  onBookNowClick: () => void;
  activeBookingsCount: number;
}

export default function Header({
  currentTab,
  setCurrentTab,
  onBookNowClick,
  activeBookingsCount,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  const navItems = [
    { label: 'Services', tab: 'services' as const },
    { label: 'Bookings', tab: 'bookings' as const },
    { label: 'Support', tab: 'support' as const },
  ];

  const getUserDisplayName = (u: any) => {
    if (!u) return 'Account';
    const raw = u.fullName || u.name || u.email || 'Account';
    return String(raw).split(' ')[0] || 'Account';
  };

  return (
    <header className="bg-background border-b border-[#1A1A1A]/10 sticky top-0 z-50 shadow-none">
      {/* Desktop Navbar */}
      <div className="hidden md:flex justify-between items-center w-full px-8 py-4 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentTab('services')}
            className="flex flex-col items-start text-left cursor-pointer hover:opacity-90 transition-opacity"
            id="logo-btn"
          >
            <span className="text-3xl font-serif font-black tracking-tighter text-primary">Nestly</span>
          </button>

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              placeholder="What service do you need?"
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-[#1A1A1A]/10 rounded-none text-sm font-sans text-on-surface focus:outline-none focus:border-primary transition-colors placeholder:text-on-surface-variant/70"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <nav className="flex items-center gap-8 text-[11px] uppercase tracking-widest font-sans font-bold">
          {navItems.map(({ label, tab }) => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`relative cursor-pointer transition-all pb-1 ${
                currentTab === tab
                  ? 'text-primary border-b border-[#1A1A1A]'
                  : 'text-on-surface-variant/60 hover:text-primary'
              }`}
              id={`nav-${tab}`}
            >
              {label}
              {tab === 'bookings' && activeBookingsCount > 0 && (
                <span className="absolute -top-1 -right-4 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {activeBookingsCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSellerModalOpen(true)}
            className="font-sans font-bold text-[10px] uppercase tracking-wider text-[#1C2B24] border border-[#1C2B24]/30 px-4 py-2 hover:bg-[#1C2B24]/5 transition-colors cursor-pointer flex items-center gap-1.5"
            id="become-seller-btn"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Become a Seller</span>
          </button>

          <button
            onClick={onBookNowClick}
            className="font-sans font-bold text-[10px] uppercase tracking-wider text-white bg-primary px-5 py-2.5 hover:opacity-90 transition-all cursor-pointer"
          >
            Book Now
          </button>

          {user ? (
            <button
              onClick={() => setCurrentTab('profile')}
              className={`transition-colors flex items-center gap-2 px-3 py-1.5 border border-[#1A1A1A]/10 cursor-pointer ${
                currentTab === 'profile' ? 'bg-[#1C2B24] text-[#FAF9F6]' : 'text-on-surface-variant hover:border-[#1A1A1A]/30'
              }`}
              title="Account profile"
            >
              <User className="w-4 h-4" />
              <span className="text-[10px] uppercase font-sans font-bold tracking-wider">{getUserDisplayName(user)}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="font-sans font-bold text-[10px] uppercase tracking-wider text-ink border border-[#1A1A1A]/20 px-4 py-2 hover:bg-[#1A1A1A]/5 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center px-4 py-4">
        <button onClick={() => setCurrentTab('services')} className="flex flex-col items-start text-left cursor-pointer">
          <span className="text-2xl font-serif font-black tracking-tighter text-primary">Nestly</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('bookings')}
            className="relative p-2 text-on-surface-variant hover:text-primary cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {activeBookingsCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                {activeBookingsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-primary cursor-pointer"
            id="mobile-menu-toggle"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1A1A1A]/10 bg-[#FAF9F6] py-4 px-4 flex flex-col gap-3">
          {navItems.map(({ label, tab }) => (
            <button
              key={tab}
              onClick={() => { setCurrentTab(tab); setMobileMenuOpen(false); }}
              className={`py-2 text-left font-sans text-xs uppercase tracking-wider font-bold border-b border-[#1A1A1A]/10 ${
                currentTab === tab ? 'text-primary' : 'text-on-surface-variant/60'
              }`}
            >
              {label}
              {tab === 'bookings' && activeBookingsCount > 0 && (
                <span className="ml-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {activeBookingsCount} Active
                </span>
              )}
            </button>
          ))}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => { setMobileMenuOpen(false); setIsSellerModalOpen(true); }}
              className="flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-bold text-[#1C2B24] border border-[#1C2B24]/30 bg-transparent flex items-center justify-center gap-1.5"
            >
              <Briefcase className="w-3.5 h-3.5" /> Become a Seller
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onBookNowClick(); }}
              className="flex-1 text-center py-2 text-[10px] uppercase tracking-wider font-bold text-white bg-primary"
            >
              Book Now
            </button>
          </div>
          {!user && (
            <button
              onClick={() => { setMobileMenuOpen(false); setIsAuthModalOpen(true); }}
              className="py-2 text-center font-sans text-xs uppercase tracking-wider font-bold text-ink border border-[#1A1A1A]/20 flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SellerApplicationModal isOpen={isSellerModalOpen} onClose={() => setIsSellerModalOpen(false)} />
    </header>
  );
}
