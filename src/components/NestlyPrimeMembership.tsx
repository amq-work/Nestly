/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  X, 
  ArrowRight, 
  Users, 
  RefreshCw, 
  Star, 
  Clock, 
  Sparkles, 
  Gem,
  Lock,
  QrCode,
  ShieldCheck
} from 'lucide-react';

interface Tier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  isPopular?: boolean;
  theme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    btnBg: string;
    btnText: string;
    btnHover: string;
    bulletColor: string;
  };
  features: string[];
  ctaLabel: string;
}

const MEMBERSHIP_TIERS: Tier[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: '$0',
    period: 'Forever',
    description: 'Basic home services for occasional bookings.',
    theme: {
      bg: 'bg-white',
      border: 'border-[#1A1A1A]/10',
      text: 'text-ink',
      badgeBg: 'bg-[#1A1A1A]/5',
      badgeText: 'text-on-surface-variant',
      btnBg: 'bg-transparent border border-[#1A1A1A]/20 text-ink',
      btnText: 'text-ink',
      btnHover: 'hover:bg-[#1A1A1A]/5',
      bulletColor: 'text-emerald-600'
    },
    features: [
      'Standard Booking Queue',
      'Vetted Professionals',
      'Transparent Pricing',
      'Email Support'
    ],
    ctaLabel: 'Choose Standard'
  },
  {
    id: 'prime',
    name: 'Nestly Prime',
    price: '$19',
    period: 'Month',
    description: 'Priority service for homeowners who want faster, smarter support.',
    badge: 'MOST POPULAR',
    isPopular: true,
    theme: {
      bg: 'bg-[#1C2B24] text-white',
      border: 'border-[#1C2B24]',
      text: 'text-white',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      badgeText: 'text-emerald-300',
      btnBg: 'bg-[#FAF9F6] text-[#1C2B24]',
      btnText: 'text-[#1C2B24]',
      btnHover: 'hover:bg-opacity-90 hover:scale-[1.01]',
      bulletColor: 'text-emerald-400'
    },
    features: [
      'Priority Dispatch',
      '15% Member Discount',
      'Annual Home Inspection',
      'Dedicated Priority Support'
    ],
    ctaLabel: 'Join Prime'
  },
  {
    id: 'estate',
    name: 'Prime Estate',
    price: '$49',
    period: 'Month',
    description: 'Complete coverage for estates and multiple properties.',
    theme: {
      bg: 'bg-white',
      border: 'border-[#1C2B24]/20',
      text: 'text-ink',
      badgeBg: 'bg-[#1C2B24]/10 text-[#1C2B24]',
      badgeText: 'text-[#1C2B24]',
      btnBg: 'bg-[#1C2B24] text-white',
      btnText: 'text-white',
      btnHover: 'hover:bg-opacity-95',
      bulletColor: 'text-emerald-600'
    },
    features: [
      'Emergency Priority Dispatch',
      '20% Member Discount',
      'Multi-Property Coverage',
      'Dedicated Property Manager'
    ],
    ctaLabel: 'Choose Estate'
  }
];

export default function NestlyPrimeMembership() {
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [selectedTier, setSelectedTier] = useState<Tier>(MEMBERSHIP_TIERS[1]);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [memberName, setMemberName] = useState<string>('');

  // Stats Counters state
  const [stats, setStats] = useState({
    members: 12100,
    renewal: 95,
    satisfaction: 4.6
  });

  // Small clean interval to count up stats on load
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const nextMembers = prev.members < 12500 ? prev.members + 80 : 12500;
        const nextRenewal = prev.renewal < 98 ? prev.renewal + 1 : 98;
        const nextSatisfaction = prev.satisfaction < 4.9 ? parseFloat((prev.satisfaction + 0.1).toFixed(1)) : 4.9;
        
        if (nextMembers === 12500 && nextRenewal === 98 && nextSatisfaction === 4.9) {
          clearInterval(interval);
        }
        return {
          members: nextMembers,
          renewal: nextRenewal,
          satisfaction: nextSatisfaction
        };
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const handleSelectTier = (tier: Tier) => {
    setSelectedTier(tier);
    setShowJoinModal(true);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !memberName) return;
    setIsJoined(true);
  };

  return (
    <section id="prime-membership-section" className="py-24 px-4 md:px-8 bg-[#FAF9F6] border-b border-[#1A1A1A]/10 relative overflow-hidden">
      {/* Decorative Grid Line Backing */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `radial-gradient(#1C2B24 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }}></div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        
        {/* Section Header & Editorial Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="bg-[#1C2B24] text-white text-[9px] uppercase tracking-[0.25em] font-sans font-bold px-3.5 py-1.5 inline-flex items-center gap-1.5 rounded-none shadow-xs">
            <Gem className="w-3 h-3 text-[#FAF9F6]" />
            <span>NESTLY PRIME</span>
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-black text-ink tracking-tight leading-tight">
            Priority Home Care, <br className="hidden sm:inline" />Without the Wait.
          </h2>
          <p className="font-sans text-sm text-on-surface-variant/85 max-w-2xl mx-auto leading-relaxed">
            Join Nestly Prime to unlock priority scheduling, exclusive member pricing, annual preventive inspections, and dedicated support. Designed for homeowners who value reliability, convenience, and peace of mind.
          </p>
        </div>

        {/* Simplified 3-Card Packages Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20 max-w-[1100px] mx-auto">
          {MEMBERSHIP_TIERS.map((tier) => {
            const isPrime = tier.id === 'prime';
            return (
              <div
                key={tier.id}
                className={`flex flex-col justify-between p-8 border transition-all duration-300 relative ${
                  isPrime 
                    ? 'bg-[#1C2B24] text-white border-[#1C2B24] shadow-md scale-102 lg:scale-105 z-10' 
                    : 'bg-white text-ink border-[#1A1A1A]/10 hover:border-[#1A1A1A]/20 shadow-xs'
                }`}
              >
                {/* Card Header & Description */}
                <div className="space-y-4">
                  {tier.badge && (
                    <div className="inline-block mb-1">
                      <span className={`text-[8.5px] uppercase tracking-widest font-extrabold px-2.5 py-1 font-sans ${tier.theme.badgeBg} ${tier.theme.badgeText} shadow-xs`}>
                        {tier.badge}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-serif text-[15px] font-black tracking-tight uppercase">
                      {tier.name}
                    </h3>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl md:text-4xl font-black tracking-tight">
                      {tier.price}
                    </span>
                    <span className={`font-sans text-xs uppercase tracking-wider font-semibold ${isPrime ? 'text-white/60' : 'text-on-surface-variant/60'}`}>
                      / {tier.period}
                    </span>
                  </div>

                  <p className={`font-sans text-xs leading-relaxed min-h-[32px] ${isPrime ? 'text-white/80' : 'text-on-surface-variant/80'}`}>
                    {tier.description}
                  </p>

                  <div className={`border-t my-5 ${isPrime ? 'border-white/10' : 'border-[#1A1A1A]/5'}`} />

                  {/* Bullet Benefits list */}
                  <ul className="space-y-3.5">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-[11.5px] leading-relaxed">
                        <Check className={`w-4 h-4 shrink-0 stroke-[2.5] ${tier.theme.bulletColor}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA Button */}
                <div className="pt-8">
                  <button
                    onClick={() => handleSelectTier(tier)}
                    className={`w-full py-3.5 text-center font-sans font-bold text-[9.5px] uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${tier.theme.btnBg} ${tier.theme.btnText} ${tier.theme.btnHover}`}
                  >
                    <span>{tier.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Statistics Dashboard Section */}
        <div className="border-t border-[#1A1A1A]/10 pt-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            
            {/* Stat Item 1 */}
            <div className="text-center space-y-1 group">
              <div className="mx-auto w-10 h-10 bg-[#1C2B24]/5 flex items-center justify-center rounded-none transition-colors group-hover:bg-[#1C2B24]/10">
                <Users className="w-5 h-5 text-[#1C2B24]" />
              </div>
              <p className="font-mono text-3xl md:text-4xl font-black text-ink tracking-tight">
                {stats.members.toLocaleString()}+
              </p>
              <p className="font-sans text-[10px] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                Active Members
              </p>
            </div>

            {/* Stat Item 2 */}
            <div className="text-center space-y-1 group">
              <div className="mx-auto w-10 h-10 bg-[#1C2B24]/5 flex items-center justify-center rounded-none transition-colors group-hover:bg-[#1C2B24]/10">
                <RefreshCw className="w-5 h-5 text-[#1C2B24]" />
              </div>
              <p className="font-mono text-3xl md:text-4xl font-black text-ink tracking-tight">
                {stats.renewal}%
              </p>
              <p className="font-sans text-[10px] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                Renewal Rate
              </p>
            </div>

            {/* Stat Item 3 */}
            <div className="text-center space-y-1 group">
              <div className="mx-auto w-10 h-10 bg-[#1C2B24]/5 flex items-center justify-center rounded-none transition-colors group-hover:bg-[#1C2B24]/10">
                <Star className="w-5 h-5 text-[#1C2B24]" />
              </div>
              <p className="font-mono text-3xl md:text-4xl font-black text-ink tracking-tight">
                {stats.satisfaction}★
              </p>
              <p className="font-sans text-[10px] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                Member Satisfaction
              </p>
            </div>

            {/* Stat Item 4 */}
            <div className="text-center space-y-1 group">
              <div className="mx-auto w-10 h-10 bg-[#1C2B24]/5 flex items-center justify-center rounded-none transition-colors group-hover:bg-[#1C2B24]/10">
                <Clock className="w-5 h-5 text-[#1C2B24]" />
              </div>
              <p className="font-mono text-3xl md:text-4xl font-black text-ink tracking-tight">
                24/7
              </p>
              <p className="font-sans text-[10px] uppercase tracking-wider text-on-surface-variant/60 font-bold">
                Priority Support
              </p>
            </div>

          </div>
        </div>

        {/* Concluding Interactive Call-to-Action Console */}
        <div className="mt-24 border border-[#1A1A1A]/10 bg-white p-8 md:p-12 relative overflow-hidden text-center max-w-4xl mx-auto">
          {/* Subtle frame corner graphics */}
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#1C2B24]"></div>
          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#1C2B24]"></div>
          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#1C2B24]"></div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#1C2B24]"></div>

          <div className="max-w-2xl mx-auto space-y-6">
            <span className="text-[8px] uppercase tracking-[0.25em] text-[#1C2B24] font-extrabold font-sans">
              LIMITED MEMBERSHIP REGISTRY OPEN
            </span>
            <h3 className="font-serif text-2xl md:text-3xl font-black text-ink tracking-tight">
              Experience Home Services at Their Highest Standard
            </h3>
            <p className="font-sans text-xs text-on-surface-variant/80 leading-relaxed">
              Become a Nestly Prime member and enjoy faster bookings, exclusive member benefits, and a seamless home service experience whenever you need professional assistance.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <button
                onClick={() => handleSelectTier(MEMBERSHIP_TIERS[1])}
                className="bg-[#1C2B24] text-white hover:bg-[#6B9080] font-sans font-bold text-[10px] uppercase tracking-widest py-3.5 px-8 rounded-none transition-all cursor-pointer flex items-center gap-2 group/cta shadow-xs"
              >
                <span>Join Nestly Prime</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/cta:translate-x-0.5" />
              </button>
              <button
                onClick={() => {
                  const target = document.getElementById('prime-membership-section');
                  if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-transparent hover:bg-[#1A1A1A]/5 border border-[#1A1A1A]/20 text-ink font-sans font-bold text-[10px] uppercase tracking-widest py-3.5 px-8 rounded-none transition-all cursor-pointer"
              >
                Explore Membership Benefits
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* High-fidelity interactive membership modal */}
      <AnimatePresence>
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="bg-[#FAF9F6] border border-[#1A1A1A]/20 p-6 md:p-8 max-w-md w-full relative shadow-xl rounded-none"
            >
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setIsJoined(false);
                }}
                className="absolute top-4 right-4 text-on-surface-variant/60 hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {!isJoined ? (
                <div className="space-y-6">
                  <div className="space-y-1.5 text-center">
                    <span className="bg-[#1C2B24] text-white text-[7.5px] uppercase tracking-widest font-extrabold px-2.5 py-1 inline-block font-sans">
                      UPGRADE TO {selectedTier.name}
                    </span>
                    <h3 className="font-serif text-2xl font-black text-ink tracking-tight">
                      Confirm Registry Information
                    </h3>
                    <p className="font-sans text-xs text-on-surface-variant/75 leading-relaxed">
                      Enter your preferred billing contact name and notification email to activate your <strong>{selectedTier.name}</strong> ({selectedTier.price}/{selectedTier.period}) status instantly.
                    </p>
                  </div>

                  <form onSubmit={handleJoinSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[8.5px] uppercase tracking-wider text-on-surface-variant/60 font-sans font-extrabold block">
                        Full Name (Account holder)
                      </label>
                      <input
                        type="text"
                        required
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full bg-white border border-[#1A1A1A]/10 px-4 py-3 text-xs text-ink focus:outline-none focus:border-[#1C2B24] rounded-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] uppercase tracking-wider text-on-surface-variant/60 font-sans font-extrabold block">
                        Direct Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="e.g. eleanor@vancehome.co"
                        className="w-full bg-white border border-[#1A1A1A]/10 px-4 py-3 text-xs text-ink focus:outline-none focus:border-[#1C2B24] rounded-none"
                      />
                    </div>

                    <div className="p-3 bg-white border border-[#1A1A1A]/5 flex items-start gap-2 text-[10px] text-on-surface-variant/70 leading-relaxed">
                      <Lock className="w-4 h-4 text-[#1C2B24] shrink-0 mt-0.5" />
                      <span>Secured connection fully compliant with extreme bank-grade SSL and private customer record guidelines. Cancel flexible anytime.</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1C2B24] text-white hover:bg-[#6B9080] font-sans font-bold text-[10px] uppercase tracking-widest py-4 rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>Activate {selectedTier.name} Benefits</span>
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-6 text-center py-4">
                  
                  {/* Premium Digital Member Card presentation */}
                  <div className="mx-auto bg-gradient-to-br from-[#1C2B24] to-[#0E1512] text-[#FAF9F6] p-6 shadow-md border border-white/10 relative text-left overflow-hidden">
                    {/* Backlight subtle lens flare effect */}
                    <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#FAF9F6]/10 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <span className="bg-[#FAF9F6]/25 text-[#FAF9F6] text-[7px] uppercase tracking-widest font-extrabold px-1.5 py-0.5 rounded-none font-sans">
                          {selectedTier.name.toUpperCase()} MEMBER
                        </span>
                        <h4 className="font-serif text-lg font-black tracking-tight mt-1.5">
                          {memberName}
                        </h4>
                      </div>
                      <Gem className="w-5 h-5 text-emerald-300 shrink-0" />
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <p className="text-[8px] uppercase tracking-wider text-white/40 font-mono">Member Serial ID</p>
                        <p className="font-mono text-xs font-bold text-white tracking-widest">
                          NP-2026-{Math.floor(1000 + Math.random() * 9000)}
                        </p>
                      </div>
                      <QrCode className="w-10 h-10 text-white/80 shrink-0" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-sm mx-auto">
                    <h3 className="font-serif text-xl font-black text-ink">
                      Welcome to Nestly, {memberName.split(' ')[0]}!
                    </h3>
                    <p className="font-sans text-xs text-on-surface-variant/75 leading-relaxed">
                      Your premium <strong>{selectedTier.name}</strong> status is fully active. A confirmation message with your digital cards, annual inspection scheduler, and priority contact credentials has been sent to <strong>{emailInput}</strong>.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowJoinModal(false);
                      setIsJoined(false);
                      setEmailInput('');
                      setMemberName('');
                    }}
                    className="w-full bg-[#1C2B24] text-white hover:bg-opacity-95 font-sans font-bold text-[10px] uppercase tracking-widest py-3 rounded-none transition-all cursor-pointer"
                  >
                    Return to Portal
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
