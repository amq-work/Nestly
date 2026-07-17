/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowLeft, 
  Star, 
  Award, 
  Briefcase, 
  Languages, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { Pro, SERVICES_CATALOG } from '../data';
import { Service } from '../types';

interface ProProfileViewProps {
  pro: Pro;
  onBack: () => void;
  onBookService: (service: Service) => void;
}

export default function ProProfileView({
  pro,
  onBack,
  onBookService,
}: ProProfileViewProps) {
  // Find actual services from catalog or custom published services offered by this pro
  const getProServices = () => {
    const savedCustom = localStorage.getItem('nestly_labour_services');
    const customList: Service[] = savedCustom ? JSON.parse(savedCustom).map((s: any) => ({
      id: s.id || `custom-${Math.random()}`,
      title: s.title,
      description: s.description,
      category: (s.category as any) || 'Handyman',
      price: s.price || '$95',
      rating: 5.0,
      reviewsCount: 1,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      badge: s.badge || 'Verified Pro',
      duration: '1-2 hrs',
    })) : [];

    let matched = SERVICES_CATALOG.filter(s => pro.services?.includes(s.id));
    if (matched.length === 0) {
      matched = SERVICES_CATALOG.filter(s =>
        pro.specialties?.some(sp => 
          sp.toLowerCase().includes(s.category.toLowerCase()) || 
          s.title.toLowerCase().includes(sp.toLowerCase()) ||
          s.category.toLowerCase().includes(sp.toLowerCase())
        )
      );
    }
    if (matched.length === 0) {
      matched = SERVICES_CATALOG.slice(0, 3);
    }
    return [...customList, ...matched];
  };

  const proServices = getProServices();

  // Dynamic and Static Reviews
  const getProReviews = () => {
    const baseReviews = [
      {
        id: 'rev-1',
        author: 'David K.',
        rating: 5,
        date: '2 weeks ago',
        text: `${pro.name} did an exceptional job! Arrived exactly on time, was extremely polite, and cleaned up perfectly after finishing. High recommendation.`,
      },
      {
        id: 'rev-2',
        author: 'Sarah M.',
        rating: 5,
        date: '1 month ago',
        text: `Super professional! It's so refreshing to have an internal, background-checked professional who clearly knows what they are doing. Will definitely book again.`,
      }
    ];

    const savedStr = localStorage.getItem('nestly_pro_reviews');
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        const filtered = parsed.filter((rev: any) => rev.proId === pro.id);
        return [...filtered, ...baseReviews];
      } catch (e) {
        console.error("Error loading reviews", e);
      }
    }
    return baseReviews;
  };

  const proReviews = getProReviews();

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 md:px-8">
      {/* Return Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-widest text-[#1C2B24] hover:opacity-80 mb-8 cursor-pointer transition-opacity"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Labours Directory</span>
      </button>

      {/* Profile Container */}
      <div className="flex flex-col gap-8">
        
        {/* Top Section: Bio & Core Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Hero Header Card */}
          <div className="md:col-span-1 bg-white border border-[#1A1A1A]/10 p-8 flex flex-col items-center text-center space-y-4">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold ${pro.avatarColor} shadow-sm`}>
              {pro.avatarText}
            </div>
            
            <div className="space-y-3 w-full">
              <div className="flex flex-col items-center gap-1.5">
                <h3 className="font-serif text-3xl font-black text-ink tracking-tight">
                  {pro.name}
                </h3>
                <span className="bg-[#FAF9F6] text-[#1D2422] border border-[#1D2422]/20 text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-none">
                  {pro.badge}
                </span>
              </div>
              
              <p className="font-sans text-xs text-on-surface-variant/80 font-bold uppercase tracking-wider px-4">
                {pro.specialties.join(' • ')}
              </p>
              
              <div className="flex items-center justify-center gap-4 text-xs font-sans pt-2">
                <div className="flex items-center text-[#F4A261] font-bold">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span>{pro.rating}</span>
                  <span className="text-on-surface-variant/60 font-normal ml-1">({pro.reviewsCount})</span>
                </div>
                <div className="w-1 h-1 bg-[#1A1A1A]/20 rounded-full"></div>
                <div className="flex items-center text-jungle-teal font-bold gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>100% On-Time</span>
                </div>
              </div>

              <div className="pt-3 w-full">
                <button
                  onClick={() => onBookService(proServices[0] || SERVICES_CATALOG[0])}
                  className="w-full bg-[#1C2B24] text-white font-sans font-bold text-xs uppercase tracking-widest px-6 py-3.5 hover:bg-opacity-90 transition-all shadow-md cursor-pointer"
                >
                  Book {pro.name.split(' ')[0]} Now
                </button>
              </div>

              <div className="mt-4 p-4 bg-[#FAF9F6] border border-[#1A1A1A]/10 text-left space-y-1.5 w-full">
                <div className="flex items-center gap-2 text-xs font-bold text-ink">
                  <ShieldCheck className="w-4 h-4 text-[#6B9080]" />
                  <span>Direct Chat Gated</span>
                </div>
                <p className="text-[11px] text-on-surface-variant/80 leading-relaxed">
                  Direct secure messaging with <b>{pro.name}</b> unlocks automatically after your booking is submitted so dispatch location can be pinned.
                </p>
              </div>
            </div>
          </div>

          {/* About / Credentials */}
          <div className="md:col-span-2 bg-white border border-[#1A1A1A]/10 p-8 space-y-8 flex flex-col justify-center">
            <div>
              <h4 className="font-serif text-2xl font-bold text-ink mb-3">About {pro.name.split(' ')[0]}</h4>
              <p className="font-sans text-sm text-on-surface-variant/80 leading-relaxed max-w-2xl">
                {pro.bio}
              </p>
            </div>

            {/* Quick credentials grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-[#1A1A1A]/10">
              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-mint-cream/80 flex items-center justify-center text-jungle-teal rounded-full">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/60">Experience</p>
                  <p className="font-sans text-sm font-bold text-ink">{pro.experienceYears} Years</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-mint-cream/80 flex items-center justify-center text-jungle-teal rounded-full">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/60">Tasks</p>
                  <p className="font-sans text-sm font-bold text-ink">{pro.completedJobs}+ Jobs</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-mint-cream/80 flex items-center justify-center text-jungle-teal rounded-full">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/60">Languages</p>
                  <p className="font-sans text-sm font-bold text-ink">{pro.languages.join(', ')}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="w-10 h-10 bg-[#F6FFF8] flex items-center justify-center text-[#6B9080] rounded-full border border-[#6B9080]/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#6B9080]">Status</p>
                  <p className="font-sans text-sm font-bold text-[#1C2B24] uppercase tracking-wider">Vetted</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Services & Reviews (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Services offered list */}
          <div className="space-y-6">
            <h4 className="font-serif text-2xl font-bold text-ink pb-2 border-b border-[#1A1A1A]/10">
              Services Offered
            </h4>
            <div className="space-y-4">
              {proServices.map(service => (
                <div 
                  key={service.id}
                  className="bg-white p-6 border border-[#1A1A1A]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-jungle-teal transition-all group shadow-sm"
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex flex-wrap items-center gap-2">
                      <h5 className="font-sans text-base font-bold text-ink group-hover:text-jungle-teal transition-colors">
                        {service.title}
                      </h5>
                      <span className="text-[9px] bg-[#E8E6E1]/60 px-2 py-0.5 uppercase font-bold text-on-surface-variant">
                        {service.price}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-on-surface-variant/70 leading-relaxed max-w-lg">
                      {service.description}
                    </p>
                  </div>
                  <button
                    onClick={() => onBookService(service)}
                    className="w-full sm:w-auto bg-[#1C2B24] text-white font-sans font-bold text-[10px] uppercase tracking-widest px-6 py-3 shrink-0 hover:bg-opacity-90 cursor-pointer shadow-md transition-all"
                  >
                    Book Service
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-6">
            <h4 className="font-serif text-2xl font-bold text-ink pb-2 border-b border-[#1A1A1A]/10">
              Customer Reviews
            </h4>
            <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 space-y-6 shadow-sm">
              {proReviews.length > 0 ? proReviews.map(rev => (
                <div key={rev.id} className="border-b border-[#1A1A1A]/5 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-sans text-sm font-bold text-ink">{rev.author}</p>
                      <div className="flex items-center text-[#F4A261] gap-1 mt-1">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-on-surface-variant/50">{rev.date}</span>
                  </div>
                  <p className="font-sans text-sm text-on-surface-variant/80 italic leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>
              )) : (
                <p className="font-sans text-sm text-on-surface-variant/60 italic">No reviews yet for this professional.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
