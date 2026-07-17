/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, MapPin, User, Mail, Phone, FileText, CheckCircle } from 'lucide-react';
import { Service, Booking } from '../types';
import { SERVICES_CATALOG, PROS_POOL, DEFAULT_PRO } from '../data';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedService: Service | null;
  onBook: (booking: Booking) => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  preselectedService,
  onBook,
}: BookingModalProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(
    preselectedService || SERVICES_CATALOG[0]
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
    }
  }, [preselectedService]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !name || !email || !phone || !address || !zipCode || !date || !time) {
      return;
    }

    // Select a random pro from the pool
    const randomProIndex = Math.floor(Math.random() * PROS_POOL.length);
    const assignedProData = PROS_POOL[randomProIndex] || DEFAULT_PRO;

    const newBooking: Booking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      serviceId: selectedService.id,
      serviceTitle: selectedService.title,
      category: selectedService.category,
      userName: name,
      userEmail: email,
      userPhone: phone,
      address,
      zipCode,
      date,
      time,
      status: 'Request', // Initially starts at 'Request' step!
      price: selectedService.price,
      priceValue: selectedService.priceValue,
      notes,
      createdAt: new Date().toISOString(),
      assignedPro: {
        name: assignedProData.name,
        avatarUrl: assignedProData.avatarText,
        rating: assignedProData.rating,
        phone: assignedProData.phone,
      },
    };

    setCreatedBooking(newBooking);
    setIsSuccess(true);
    onBook(newBooking);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setZipCode('');
    setDate('');
    setTime('');
    setNotes('');
    setIsSuccess(false);
    setCreatedBooking(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" id="booking-modal-container">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1D2422] opacity-50"
        />

        {/* Modal Window Container */}
        <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-2xl bg-white rounded-none p-6 sm:p-8 shadow-none border border-[#1A1A1A]/15 z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-3xl font-serif font-black tracking-tight text-ink" id="modal-title">
                  {isSuccess ? 'Booking Confirmed!' : 'Schedule Nestly Help'}
                </h3>
                <p className="text-xs font-sans text-on-surface-variant/80 mt-1">
                  {isSuccess
                    ? 'Our vetted internal team is on top of it.'
                    : 'Provide details, and we’ll assign an expert internal Pro.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-none hover:bg-[#1A1A1A]/5 text-on-surface-variant transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess && createdBooking ? (
              /* Success View */
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-[#E8E6E1]/50 rounded-none flex items-center justify-center mx-auto mb-6 text-primary">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-serif font-bold text-ink mb-2">
                  Thank you, {createdBooking.userName}!
                </h4>
                <p className="text-xs text-on-surface-variant/80 max-w-md mx-auto mb-6">
                  Your request for <span className="font-bold text-ink">{createdBooking.serviceTitle}</span> has been logged under ID <span className="font-mono text-xs bg-[#E8E6E1]/50 px-2 py-0.5 rounded-none font-bold text-[#1A1A1A]">{createdBooking.id}</span>. We've assigned <span className="font-bold">{createdBooking.assignedPro?.name}</span> to handle your visit.
                </p>

                {/* Summary Card */}
                <div className="bg-[#FAF9F6] rounded-none p-4 text-left max-w-md mx-auto mb-8 border border-[#1A1A1A]/10">
                  <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                    <span>Service:</span>
                    <span className="font-semibold text-ink">{createdBooking.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                    <span>Scheduled Time:</span>
                    <span className="font-semibold text-ink">{createdBooking.date} at {createdBooking.time}</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                    <span>Address:</span>
                    <span className="font-semibold text-ink">{createdBooking.address}</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant pt-2 border-t border-[#1A1A1A]/10">
                    <span className="font-bold text-[#1A1A1A]">Total Estimated:</span>
                    <span className="font-serif font-bold text-[#1A1A1A] text-sm">{createdBooking.price}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="font-sans font-bold text-[10px] uppercase tracking-wider text-white bg-[#1A1A1A] px-6 py-3 rounded-none hover:bg-opacity-90 transition-all cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Service Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-ink uppercase tracking-widest mb-2">
                    Select Service
                  </label>
                  <select
                    value={selectedService?.id || ''}
                    onChange={(e) => {
                      const found = SERVICES_CATALOG.find((s) => s.id === e.target.value);
                      if (found) setSelectedService(found);
                    }}
                    className="w-full bg-white border border-[#1A1A1A]/20 rounded-none px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#1A1A1A]"
                  >
                    {SERVICES_CATALOG.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.price} - {s.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtext info about the service */}
                {selectedService && (
                  <div className="bg-[#E8E6E1]/30 rounded-none p-3 border border-[#1A1A1A]/10 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#1A1A1A]">{selectedService.title}</p>
                      <p className="text-on-surface-variant/80 mt-0.5">{selectedService.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <span className="text-on-surface-variant/60 text-[9px] uppercase tracking-wider block mb-0.5">Est. Rate</span>
                      <span className="text-sm font-serif font-bold text-[#1A1A1A]">{selectedService.price}</span>
                    </div>
                  </div>
                )}

                {/* Input Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      className="w-full bg-white border border-[#1A1A1A]/25 rounded-none px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#1A1A1A]"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(555) 123-4567"
                      className="w-full bg-white border border-[#1A1A1A]/25 rounded-none px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#1A1A1A]"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="jane.doe@example.com"
                      className="w-full bg-white border border-[#1A1A1A]/25 rounded-none px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#1A1A1A]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Street Address
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="124 Maple Ave"
                      className="w-full bg-white border border-[#1A1A1A]/25 rounded-none px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#1A1A1A]"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Zip Code
                    </label>
                    <input
                      type="text"
                      required
                      pattern="[0-9]{5}"
                      placeholder="98101"
                      className="w-full bg-white border border-[#1A1A1A]/25 rounded-none px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#1A1A1A]"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full bg-white border border-[#1A1A1A]/25 rounded-none px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#1A1A1A]"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-[10px] font-bold text-ink uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Preferred Time
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full bg-white border border-[#1A1A1A]/25 rounded-none px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#1A1A1A]"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-ink uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#1A1A1A]/60" /> Special Instructions / Job Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us what you need done. (e.g. Faucet model name, where the shut-off valve is located...)"
                    className="w-full bg-white border border-[#1A1A1A]/25 rounded-none px-3 py-2 text-xs text-ink focus:outline-none focus:border-[#1A1A1A]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-3 pt-3 border-t border-[#1A1A1A]/10">
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-sans font-bold text-[10px] uppercase tracking-wider text-on-surface-variant bg-white border border-[#1A1A1A]/15 px-5 py-2.5 rounded-none hover:bg-[#E8E6E1]/50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="font-sans font-bold text-[10px] uppercase tracking-wider text-white bg-[#1A1A1A] px-6 py-2.5 rounded-none hover:bg-opacity-90 transition-all cursor-pointer"
                    id="submit-booking-btn"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
