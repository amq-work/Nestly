/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface FooterProps {
  onNavClick: (tab: 'services' | 'bookings' | 'support' | 'profile') => void;
}

export default function Footer({ onNavClick }: FooterProps) {
  return (
    <footer className="w-full px-6 md:px-16 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-[1200px] mx-auto bg-[#E8E6E1]/40 border-t border-[#1A1A1A]/10 rounded-none mt-16 mb-6">
      <div className="col-span-2 md:col-span-1 flex flex-col items-start">
        <span className="font-serif text-3xl font-black text-primary tracking-tighter mb-4">Nestly</span>
        <p className="font-sans text-xs text-on-surface-variant max-w-xs leading-relaxed">
          Managed Household Services. Vetted internal professionals ready to assist with high-end reliability and comfort.
        </p>
        <p className="font-sans text-[10px] uppercase tracking-wider text-on-surface-variant/70 mt-8 leading-tight">
          © 2026 Nestly Publishing Group.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-sans text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
          Services
        </h4>
        <button
          onClick={() => onNavClick('services')}
          className="text-left font-sans text-xs uppercase tracking-wider text-on-surface-variant hover:text-primary transition-all cursor-pointer"
        >
          Cleaning
        </button>
        <button
          onClick={() => onNavClick('services')}
          className="text-left font-sans text-xs uppercase tracking-wider text-on-surface-variant hover:text-primary transition-all cursor-pointer"
        >
          Plumbing
        </button>
        <button
          onClick={() => onNavClick('services')}
          className="text-left font-sans text-xs uppercase tracking-wider text-on-surface-variant hover:text-primary transition-all cursor-pointer"
        >
          Electrical
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-sans text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
          Support
        </h4>
        <button
          onClick={() => onNavClick('support')}
          className="text-left font-sans text-xs uppercase tracking-wider text-on-surface-variant hover:text-primary transition-all cursor-pointer"
        >
          Help Center
        </button>
        <a
          href="mailto:support@nestly.com"
          className="text-left font-sans text-xs uppercase tracking-wider text-on-surface-variant hover:text-primary transition-all cursor-pointer"
        >
          Contact Us
        </a>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="font-sans text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
          Legal & Social
        </h4>
        <a
          href="#"
          className="font-sans text-xs uppercase tracking-wider text-on-surface-variant hover:text-primary transition-all"
        >
          Terms of Service
        </a>
        <a
          href="#"
          className="font-sans text-xs uppercase tracking-wider text-on-surface-variant hover:text-primary transition-all"
        >
          Privacy Policy
        </a>
        <a
          href="/Nestly Project Case Study.pdf"
          download
          className="font-sans text-xs uppercase tracking-wider text-on-surface-variant hover:text-primary transition-all"
        >
          Project Case Study
        </a>
        <div className="flex gap-4 mt-2 text-[10px] uppercase tracking-widest font-sans font-bold text-on-surface-variant">
          <span className="hover:text-primary cursor-pointer">Instagram</span>
          <span className="hover:text-primary cursor-pointer">Twitter</span>
        </div>
      </div>
    </footer>
  );
}
