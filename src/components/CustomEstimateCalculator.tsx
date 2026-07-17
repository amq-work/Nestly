/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Droplet, 
  Zap, 
  Brush, 
  Hammer, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Info, 
  Sparkles 
} from 'lucide-react';
import { Service } from '../types';
import { PROS_POOL, DEFAULT_PRO, Pro } from '../data';

interface CustomEstimateCalculatorProps {
  onBookService: (service: Service) => void;
  initialQuery?: string;
}

type CategoryType = 'plumbing' | 'electrical' | 'cleaning' | 'handyman';

export default function CustomEstimateCalculator({
  onBookService,
  initialQuery = ''
}: CustomEstimateCalculatorProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('plumbing');

  // Sliders and state for each category
  // Plumbing State
  const [fixtures, setFixtures] = useState(1);
  const [plumbingComplexity, setPlumbingComplexity] = useState<'standard' | 'major'>('standard');

  // Electrical State
  const [electricalUnits, setElectricalUnits] = useState(1);
  const [isEmergency, setIsEmergency] = useState(false);

  // Cleaning State
  const [rooms, setRooms] = useState(2);
  const [cleaningTier, setCleaningTier] = useState<'standard' | 'deep'>('standard');

  // Handyman State
  const [handymanHours, setHandymanHours] = useState(2);
  const [wallMaterial, setWallMaterial] = useState<'drywall' | 'brick' | 'marble'>('drywall');

  // Reset category based on initial search query if there is a match
  useEffect(() => {
    if (initialQuery) {
      const query = initialQuery.toLowerCase();
      if (query.includes('sink') || query.includes('leak') || query.includes('plumb') || query.includes('faucet')) {
        setActiveCategory('plumbing');
      } else if (query.includes('electric') || query.includes('light') || query.includes('fan') || query.includes('power') || query.includes('wire')) {
        setActiveCategory('electrical');
      } else if (query.includes('clean') || query.includes('sweep') || query.includes('dust') || query.includes('wash')) {
        setActiveCategory('cleaning');
      } else if (query.includes('mount') || query.includes('tv') || query.includes('hang') || query.includes('yard') || query.includes('fix')) {
        setActiveCategory('handyman');
      }
    }
  }, [initialQuery]);

  // Determine pricing dynamically
  let totalPrice = 0;
  let breakdown: { label: string; amount: number }[] = [];
  let assignedPro: Pro = PROS_POOL[0] || DEFAULT_PRO;

  if (activeCategory === 'plumbing') {
    assignedPro = PROS_POOL.find(p => p.id === 'pro-marcus') || PROS_POOL[0] || DEFAULT_PRO;
    const base = 85;
    const fixtureCost = fixtures * 40;
    const complexityPremium = plumbingComplexity === 'major' ? 60 : 0;
    totalPrice = base + fixtureCost + complexityPremium;
    breakdown = [
      { label: 'Licensed Plumber Base Rate', amount: base },
      { label: `Fixture Service Cost (${fixtures} × $40)`, amount: fixtureCost },
      { label: plumbingComplexity === 'major' ? 'Major System Diagnostic' : 'Standard Alignment', amount: complexityPremium },
    ];
  } else if (activeCategory === 'electrical') {
    assignedPro = PROS_POOL.find(p => p.id === 'pro-devon') || PROS_POOL[2] || DEFAULT_PRO;
    const base = 110;
    const unitsCost = electricalUnits * 30;
    const urgencyPremium = isEmergency ? 80 : 0;
    totalPrice = base + unitsCost + urgencyPremium;
    breakdown = [
      { label: 'Certified Electrician Dispatch', amount: base },
      { label: `Unit/Light Connections (${electricalUnits} × $30)`, amount: unitsCost },
      { label: isEmergency ? 'Urgent Emergency Priority' : 'Standard Routine Booking', amount: urgencyPremium },
    ];
  } else if (activeCategory === 'cleaning') {
    assignedPro = PROS_POOL.find(p => p.id === 'pro-elena') || PROS_POOL[1] || DEFAULT_PRO;
    const base = 65;
    const roomCost = rooms * 30;
    const tierCost = cleaningTier === 'deep' ? 45 : 0;
    totalPrice = base + roomCost + tierCost;
    breakdown = [
      { label: 'Sanitation Pro Base Rate', amount: base },
      { label: `Area / Room Detailing (${rooms} × $30)`, amount: roomCost },
      { label: cleaningTier === 'deep' ? 'Eco-HEPA Deep Disinfection' : 'General Maintenance Clean', amount: tierCost },
    ];
  } else if (activeCategory === 'handyman') {
    assignedPro = PROS_POOL.find(p => p.id === 'pro-sasha') || PROS_POOL[3] || DEFAULT_PRO;
    const base = 55;
    const hoursCost = handymanHours * 35;
    let materialCost = 0;
    let materialLabel = 'Standard Sheetrock Drywall';
    if (wallMaterial === 'brick') {
      materialCost = 25;
      materialLabel = 'Masonry/Solid Brick Anchoring';
    } else if (wallMaterial === 'marble') {
      materialCost = 45;
      materialLabel = 'Diamond-Bit Ceramic/Marble Drilling';
    }
    totalPrice = base + hoursCost + materialCost;
    breakdown = [
      { label: 'Elite Craftsman Base Rate', amount: base },
      { label: `Labor Duration Estimate (${handymanHours} hrs × $35)`, amount: hoursCost },
      { label: materialLabel, amount: materialCost },
    ];
  }

  const handleBookNow = () => {
    // Generate a beautiful, descriptive dynamic service title
    let title = '';
    let description = '';
    let iconName = 'Sparkles';

    if (activeCategory === 'plumbing') {
      title = `${fixtures} Fixture Plumbing Repair`;
      description = `Certified Plumbing Alignment for ${fixtures} fixture(s) with ${plumbingComplexity === 'major' ? 'heavy system overhaul' : 'standard leak repair'}. Assigned specialist: ${assignedPro.name}.`;
      iconName = 'Droplet';
    } else if (activeCategory === 'electrical') {
      title = `${isEmergency ? 'Urgent' : 'Standard'} Electrical Installation`;
      description = `Electrical safety connection and diagnostic for ${electricalUnits} unit(s)/fixture(s). ${isEmergency ? 'Urgent dispatch.' : 'Standard scheduling.'} Assigned specialist: ${assignedPro.name}.`;
      iconName = 'Zap';
    } else if (activeCategory === 'cleaning') {
      title = `${cleaningTier === 'deep' ? 'Deep HEPA' : 'Standard'} Home Cleaning`;
      description = `Eco-friendly, botanical detailed cleanup covering ${rooms} room(s) at ${cleaningTier === 'deep' ? 'deep sanitation levels' : 'standard level'}. Assigned specialist: ${assignedPro.name}.`;
      iconName = 'Brush';
    } else if (activeCategory === 'handyman') {
      title = `Custom Handyman Labor (${handymanHours} Hrs)`;
      description = `Expert carpentry, mounting, or repairs for estimated ${handymanHours} hours on ${wallMaterial} surface. Assigned specialist: ${assignedPro.name}.`;
      iconName = 'Hammer';
    }

    const customService: Service = {
      id: `custom-${activeCategory}-${Date.now()}`,
      title,
      description,
      category: activeCategory.toUpperCase(),
      price: `$${totalPrice}`,
      priceValue: totalPrice,
      iconName,
      badge: isEmergency || activeCategory === 'electrical' ? 'Priority' : 'Standard',
      isEmergency: isEmergency
    };

    onBookService(customService);
  };

  return (
    <div className="bg-[#FAF9F6] border-y border-[#1A1A1A]/10 py-20 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Section Header */}
        <div className="mb-12 text-center md:text-left">
          <span className="bg-[#1C2B24] text-[#FAF9F6] text-[9px] uppercase tracking-[0.2em] font-sans font-bold px-3 py-1 inline-block mb-3">
            D_DYNAMICS CORE ESTIMATOR
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-black text-ink tracking-tight mb-3">
            Interactive Labor Planner
          </h2>
          <p className="font-sans text-sm text-on-surface-variant/80 max-w-2xl">
            Skip the blind phone quotes. Use our interactive estimator to configure your exact project dimensions. See an immediate pricing breakdown and assign a certified Nestly staff Pro in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Panel: Control Center */}
          <div className="lg:col-span-7 bg-white border border-[#1A1A1A]/10 p-6 md:p-8 flex flex-col justify-between">
            <div>
              {/* Category selector tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
                {[
                  { id: 'plumbing', label: 'Plumbing', icon: Droplet, color: 'text-sky-600 bg-sky-50' },
                  { id: 'electrical', label: 'Electrical', icon: Zap, color: 'text-amber-600 bg-amber-50' },
                  { id: 'cleaning', label: 'Cleaning', icon: Brush, color: 'text-emerald-600 bg-emerald-50' },
                  { id: 'handyman', label: 'Handyman', icon: Hammer, color: 'text-orange-600 bg-orange-50' }
                ].map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id as CategoryType)}
                      className={`flex flex-col items-center justify-center py-4 px-2 border transition-all cursor-pointer rounded-none ${
                        isActive 
                          ? 'border-[#1C2B24] bg-[#1C2B24] text-white shadow-sm'
                          : 'border-[#1A1A1A]/10 bg-white text-ink hover:border-[#1C2B24]/40'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${isActive ? 'text-white' : 'text-on-surface-variant'}`} />
                      <span className="font-sans text-[10px] uppercase tracking-wider font-bold">
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic input configuration cards depending on activeCategory */}
              <div className="space-y-6">
                
                {activeCategory === 'plumbing' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-ink">
                          Number of Fixtures / Sinks:
                        </label>
                        <span className="font-serif text-lg font-black text-[#1C2B24] bg-[#F6FFF8] px-3 py-1 border border-[#6B9080]/25">
                          {fixtures} {fixtures === 1 ? 'Fixture' : 'Fixtures'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        className="w-full accent-[#1C2B24] bg-[#FAF9F6] h-1.5 rounded-none appearance-none cursor-pointer"
                        value={fixtures}
                        onChange={(e) => setFixtures(parseInt(e.target.value))}
                      />
                      <div className="flex justify-between text-[9px] uppercase tracking-wider font-sans text-on-surface-variant/60 mt-1">
                        <span>1 Fixture</span>
                        <span>5 Fixtures Max</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-2">
                        Complexity & Scope:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPlumbingComplexity('standard')}
                          className={`p-3 text-xs font-sans font-bold uppercase tracking-wider text-center border cursor-pointer ${
                            plumbingComplexity === 'standard'
                              ? 'bg-[#F6FFF8] border-[#6B9080] text-[#1C2B24]'
                              : 'bg-white border-[#1A1A1A]/10 text-on-surface-variant'
                          }`}
                        >
                          Standard Alignment
                          <span className="block text-[8px] font-normal lowercase tracking-normal mt-0.5 opacity-70">
                            faucet swap, standard leaks
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlumbingComplexity('major')}
                          className={`p-3 text-xs font-sans font-bold uppercase tracking-wider text-center border cursor-pointer ${
                            plumbingComplexity === 'major'
                              ? 'bg-[#F6FFF8] border-[#6B9080] text-[#1C2B24]'
                              : 'bg-white border-[#1A1A1A]/10 text-on-surface-variant'
                          }`}
                        >
                          Heavy Plumbing (+$60)
                          <span className="block text-[8px] font-normal lowercase tracking-normal mt-0.5 opacity-70">
                            main shut-off swap, line leaks
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory === 'electrical' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-ink">
                          Fixtures / Switches to Install:
                        </label>
                        <span className="font-serif text-lg font-black text-[#1C2B24] bg-[#F6FFF8] px-3 py-1 border border-[#6B9080]/25">
                          {electricalUnits} {electricalUnits === 1 ? 'Unit' : 'Units'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        step="1"
                        className="w-full accent-[#1C2B24] bg-[#FAF9F6] h-1.5 rounded-none appearance-none cursor-pointer"
                        value={electricalUnits}
                        onChange={(e) => setElectricalUnits(parseInt(e.target.value))}
                      />
                      <div className="flex justify-between text-[9px] uppercase tracking-wider font-sans text-on-surface-variant/60 mt-1">
                        <span>1 Switch/Fan</span>
                        <span>8 Units Max</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-2">
                        Response Priority Mode:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEmergency(false)}
                          className={`p-3 text-xs font-sans font-bold uppercase tracking-wider text-center border cursor-pointer ${
                            !isEmergency
                              ? 'bg-[#F6FFF8] border-[#6B9080] text-[#1C2B24]'
                              : 'bg-white border-[#1A1A1A]/10 text-on-surface-variant'
                          }`}
                        >
                          Standard Slot
                          <span className="block text-[8px] font-normal lowercase tracking-normal mt-0.5 opacity-70">
                            next 1-3 business days
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEmergency(true)}
                          className={`p-3 text-xs font-sans font-bold uppercase tracking-wider text-center border cursor-pointer ${
                            isEmergency
                              ? 'bg-[#F6FFF8] border-[#6B9080] text-[#1C2B24]'
                              : 'bg-white border-[#1A1A1A]/10 text-on-surface-variant'
                          }`}
                        >
                          Urgent Priority (+$80)
                          <span className="block text-[8px] font-normal lowercase tracking-normal mt-0.5 opacity-70">
                            guaranteed same-day slot
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory === 'cleaning' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-ink">
                          Total Rooms / Areas:
                        </label>
                        <span className="font-serif text-lg font-black text-[#1C2B24] bg-[#F6FFF8] px-3 py-1 border border-[#6B9080]/25">
                          {rooms} {rooms === 1 ? 'Room' : 'Rooms'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        step="1"
                        className="w-full accent-[#1C2B24] bg-[#FAF9F6] h-1.5 rounded-none appearance-none cursor-pointer"
                        value={rooms}
                        onChange={(e) => setRooms(parseInt(e.target.value))}
                      />
                      <div className="flex justify-between text-[9px] uppercase tracking-wider font-sans text-on-surface-variant/60 mt-1">
                        <span>1 Room</span>
                        <span>6 Rooms Max</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-2">
                        Detailing Level:
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setCleaningTier('standard')}
                          className={`p-3 text-xs font-sans font-bold uppercase tracking-wider text-center border cursor-pointer ${
                            cleaningTier === 'standard'
                              ? 'bg-[#F6FFF8] border-[#6B9080] text-[#1C2B24]'
                              : 'bg-white border-[#1A1A1A]/10 text-on-surface-variant'
                          }`}
                        >
                          Standard Maintenance
                          <span className="block text-[8px] font-normal lowercase tracking-normal mt-0.5 opacity-70">
                            dusting, sweeping, counters
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCleaningTier('deep')}
                          className={`p-3 text-xs font-sans font-bold uppercase tracking-wider text-center border cursor-pointer ${
                            cleaningTier === 'deep'
                              ? 'bg-[#F6FFF8] border-[#6B9080] text-[#1C2B24]'
                              : 'bg-white border-[#1A1A1A]/10 text-on-surface-variant'
                          }`}
                        >
                          Eco Deep HEPA (+$45)
                          <span className="block text-[8px] font-normal lowercase tracking-normal mt-0.5 opacity-70">
                            bathrooms deep, wall scrubbing
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeCategory === 'handyman' && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] uppercase tracking-widest font-sans font-bold text-ink">
                          Estimated Hours Needed:
                        </label>
                        <span className="font-serif text-lg font-black text-[#1C2B24] bg-[#F6FFF8] px-3 py-1 border border-[#6B9080]/25">
                          {handymanHours} {handymanHours === 1 ? 'Hour' : 'Hours'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        step="1"
                        className="w-full accent-[#1C2B24] bg-[#FAF9F6] h-1.5 rounded-none appearance-none cursor-pointer"
                        value={handymanHours}
                        onChange={(e) => setHandymanHours(parseInt(e.target.value))}
                      />
                      <div className="flex justify-between text-[9px] uppercase tracking-wider font-sans text-on-surface-variant/60 mt-1">
                        <span>1 Hour</span>
                        <span>6 Hours Max</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-1">
                        Mounting Surface Material:
                      </label>
                      <select
                        className="w-full px-3 py-3 bg-[#FAF9F6] border border-[#1A1A1A]/15 text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#1C2B24]"
                        value={wallMaterial}
                        onChange={(e) => setWallMaterial(e.target.value as any)}
                      >
                        <option value="drywall">Standard Drywall / Wood Studs (+$0)</option>
                        <option value="brick">Solid Masonry / Concrete / Brick Wall (+$25)</option>
                        <option value="marble">Heavy Ceramic Tile / Marble / Granite (+$45)</option>
                      </select>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Quick trust guarantee info line */}
            <div className="mt-8 pt-4 border-t border-[#1A1A1A]/5 flex items-center gap-2.5 text-[10px] font-sans text-[#1C2B24]">
              <ShieldCheck className="w-4 h-4 text-[#6B9080] shrink-0" />
              <span>Nestly Fixed Guarantee: No hidden broker fees. Secure booking locks in your worker directly.</span>
            </div>
          </div>

          {/* Right Panel: Receipt and Pro Matching */}
          <div className="lg:col-span-5 bg-[#1C2B24] text-white p-6 md:p-8 flex flex-col justify-between border border-[#1A1A1A]/10">
            <div>
              <span className="text-[#F4A261] text-[8px] uppercase tracking-[0.25em] font-sans font-bold block mb-1">
                TRANSPARENT NESTLY LABOUR QUOTE
              </span>
              <h3 className="font-serif text-2xl font-black text-white tracking-tight mb-6">
                Transparent Pricing Detail
              </h3>

              {/* Cost breakdown */}
              <div className="space-y-3.5 border-b border-white/10 pb-6 mb-6">
                {breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-sans text-white/80">
                    <span>{item.label}</span>
                    <span className="font-mono font-bold">${item.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total price and proceed button */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#FAF9F6]/60 font-sans font-bold">
                    ESTIMATED TOTAL PRICE
                  </p>
                  <p className="font-serif text-3xl font-black text-[#F4A261] tracking-tight mt-0.5">
                    ${totalPrice}
                  </p>
                </div>
                <span className="bg-[#6B9080]/30 border border-[#6B9080]/35 text-[#F6FFF8] text-[8px] uppercase tracking-widest font-sans font-bold px-2.5 py-1">
                  100% Guaranteed Rate
                </span>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-[#FAF9F6] text-[#1C2B24] hover:bg-opacity-95 font-sans font-bold text-xs uppercase tracking-widest py-4 rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Secure Labour & Chat</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="font-sans text-[9px] text-[#FAF9F6]/50 text-center mt-3">
                Clicking will open secure account creation & direct-messaging with your selected specialist.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
