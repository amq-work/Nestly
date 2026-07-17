/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, Phone, User, CheckCircle, Shield, Play, RotateCcw, AlertTriangle, MessageSquare, Wrench, Star } from 'lucide-react';
import { Booking, BookingStatus } from '../types';
import StepperTracker from './StepperTracker';
import TrackingMapSimulator from './TrackingMapSimulator';
import FeedbackRatingForm from './FeedbackRatingForm';
import CustomEstimateCalculator from './CustomEstimateCalculator';
import { PROS_POOL } from '../data';

interface BookingsDashboardProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: BookingStatus) => void;
  onReschedule: (id: string, date: string, time: string) => void;
  onCancel: (id: string) => void;
  onBookNowClick: () => void;
  onBookService?: (service: any, pro?: any) => void;
}

export default function BookingsDashboard({
  bookings,
  onStatusChange,
  onReschedule,
  onCancel,
  onBookNowClick,
  onBookService,
}: BookingsDashboardProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    bookings.length > 0 ? bookings[0].id : null
  );
  
  // Reschedule form states
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  // Support chat state
  const [isContacting, setIsContacting] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactFeedback, setContactFeedback] = useState('');
  const [bookingChats, setBookingChats] = useState<Record<string, { sender: 'system' | 'pro' | 'user'; text: string; time: string; isPinned?: boolean }[]>>(() => {
    const saved = localStorage.getItem('nestly_booking_chats');
    return saved ? JSON.parse(saved) : {};
  });

  // Rated bookings state
  const [ratedBookings, setRatedBookings] = useState<Record<string, { rating: number; text: string; tags: string[]; author: string }>>(() => {
    const saved = localStorage.getItem('nestly_rated_bookings');
    return saved ? JSON.parse(saved) : {};
  });

  const handleFeedbackSubmit = (review: { rating: number; text: string; tags: string[]; author: string }) => {
    if (!selectedBooking) return;
    
    // Save locally
    const updated = {
      ...ratedBookings,
      [selectedBooking.id]: review
    };
    setRatedBookings(updated);
    localStorage.setItem('nestly_rated_bookings', JSON.stringify(updated));

    // Save to the public/global reviews log for ProProfileView to load
    const proId = selectedBooking.assignedPro ? PROS_POOL.find(p => p.name === selectedBooking.assignedPro?.name)?.id || 'unknown' : 'unknown';
    const newProReview = {
      id: `dyn-rev-${Date.now()}`,
      proId,
      bookingId: selectedBooking.id,
      rating: review.rating,
      text: review.text,
      tags: review.tags,
      date: 'Just now',
      author: review.author
    };

    const existingStr = localStorage.getItem('nestly_pro_reviews');
    const existing = existingStr ? JSON.parse(existingStr) : [];
    localStorage.setItem('nestly_pro_reviews', JSON.stringify([newProReview, ...existing]));
  };

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  const activeBookings = bookings.filter((b) => b.status !== 'Completed' && b.status !== 'Cancelled');
  const pastBookings = bookings.filter((b) => b.status === 'Completed' || b.status === 'Cancelled');

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBookingId && rescheduleDate && rescheduleTime) {
      onReschedule(selectedBookingId, rescheduleDate, rescheduleTime);
      setIsRescheduling(false);
      setRescheduleDate('');
      setRescheduleTime('');
    }
  };

  const getChatMessagesForBooking = (b: Booking) => {
    if (bookingChats[b.id]) return bookingChats[b.id];
    return [
      {
        sender: 'system' as const,
        isPinned: true,
        text: `📍 Service Location Pinned: ${b.address || 'User Location'} (GPS Dispatch Coordinate Locked)`,
        time: 'Booking Confirmed',
      },
      {
        sender: 'pro' as const,
        text: `Hello! I have received your booking for ${b.serviceTitle} at ${b.address}. I will keep you updated as I head to your location!`,
        time: 'System Dispatch',
      },
    ];
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim() || !selectedBooking) return;
    const currentList = getChatMessagesForBooking(selectedBooking);
    const userMsgText = contactMessage.trim();
    const updatedList = [
      ...currentList,
      {
        sender: 'user' as const,
        text: userMsgText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    const newChats = {
      ...bookingChats,
      [selectedBooking.id]: updatedList,
    };
    setBookingChats(newChats);
    localStorage.setItem('nestly_booking_chats', JSON.stringify(newChats));
    setContactMessage('');

    // Simulated pro dispatch acknowledgment after 1s
    setTimeout(() => {
      setBookingChats((prev) => {
        const latest = prev[selectedBooking.id] || updatedList;
        const autoReply = [
          ...latest,
          {
            sender: 'pro' as const,
            text: `Received: "${userMsgText}". Thank you for the update!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
        const res = { ...prev, [selectedBooking.id]: autoReply };
        localStorage.setItem('nestly_booking_chats', JSON.stringify(res));
        return res;
      });
    }, 1000);
  };

  // Simulates progress to next logical status
  const handleAdvanceSimulation = () => {
    if (!selectedBooking) return;
    const current = selectedBooking.status;
    let next: BookingStatus = current;
    if (current === 'Request') next = 'Assigned';
    else if (current === 'Assigned') next = 'En Route';
    else if (current === 'En Route') next = 'Arrived';
    else if (current === 'Arrived') next = 'In Progress';
    else if (current === 'In Progress') next = 'Completed';
    else if (current === 'Completed') next = 'Paid';

    if (next !== current) {
      onStatusChange(selectedBooking.id, next);
    }
  };

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case 'Request':
        return 'bg-[#F6FFF8] text-[#6B9080] border-[#6B9080]/20';
      case 'Assigned':
        return 'bg-[#F6FFF8] text-[#1C2B24] border-[#1C2B24]/20';
      case 'En Route':
        return 'bg-[#F6FFF8] text-[#F4A261] border-[#F4A261]/30';
      case 'In Progress':
        return 'bg-[#F6FFF8] text-[#F4A261] border-[#F4A261]/40';
      case 'Completed':
        return 'bg-[#F6FFF8] text-[#6B9080] border-[#6B9080]/30';
      case 'Paid':
        return 'bg-[#F6FFF8] text-[#6B9080] border-[#6B9080]/50 font-bold';
      case 'Cancelled':
        return 'bg-[#F6FFF8] text-[#D62828] border-[#D62828]/25';
      default:
        return 'bg-white text-on-surface-variant border-[#1A1A1A]/10';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">
      <div className="mb-8 border-b border-[#1A1A1A]/10 pb-6">
        <span className="text-[9px] uppercase tracking-[0.25em] font-sans font-bold opacity-60 block mb-2">My Portfolio</span>
        <h2 className="text-4xl font-serif font-black tracking-tighter text-ink">My Bookings</h2>
        <p className="text-sm font-sans text-on-surface-variant/80 mt-1">
          Track active jobs, reschedule, or review past Nestly visits.
        </p>
      </div>

      {bookings.length === 0 ? (
        /* Empty State with Interactive Labor Planner */
        <div className="space-y-10">
          <div className="bg-white rounded-none p-8 text-center border border-[#1A1A1A]/10 max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-[#E8E6E1]/50 rounded-none flex items-center justify-center mx-auto mb-4 text-primary">
              <Wrench className="w-7 h-7" />
            </div>
            <h3 className="text-3xl font-serif font-black text-ink mb-2">Interactive Labor Planner</h3>
            <p className="text-sm font-sans text-on-surface-variant/80 max-w-md mx-auto leading-relaxed">
              You have no active bookings yet. Customize your service specifications below to get instant transparent pricing and book a vetted specialist directly.
            </p>
          </div>
          <CustomEstimateCalculator onBookService={onBookService || ((s) => onBookNowClick())} />
        </div>
      ) : (
        /* Master-Detail Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Master List (Left Column) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Active Bookings */}
            <div>
              <h3 className="text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-3">
                Active Bookings ({activeBookings.length})
              </h3>
              {activeBookings.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic bg-white p-4 rounded-none border border-[#1A1A1A]/10">
                  No active requests.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBookingId(b.id);
                        setIsRescheduling(false);
                        setIsContacting(false);
                      }}
                      className={`w-full text-left p-4 rounded-none border transition-all cursor-pointer ${
                        selectedBookingId === b.id
                          ? 'bg-white border-[#1A1A1A] ring-1 ring-[#1A1A1A]'
                          : 'bg-white/60 border-[#1A1A1A]/10 hover:bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-sans font-bold text-[9px] uppercase tracking-wider text-primary bg-[#E8E6E1]/50 px-2 py-0.5 rounded-none">
                          {b.id}
                        </span>
                        <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border ${getStatusStyle(b.status)}`}>
                          {b.status}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-lg text-ink leading-tight mb-1">
                        {b.serviceTitle}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant/80 mt-2">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{b.date} at {b.time}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Past Bookings */}
            <div>
              <h3 className="text-[10px] uppercase tracking-widest font-sans font-bold text-ink mb-3">
                Completed & Past ({pastBookings.length})
              </h3>
              {pastBookings.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic bg-white/40 p-4 rounded-none border border-[#1A1A1A]/10">
                  No past booking history.
                </p>
              ) : (
                <div className="space-y-3">
                  {pastBookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBookingId(b.id);
                        setIsRescheduling(false);
                        setIsContacting(false);
                      }}
                      className={`w-full text-left p-4 rounded-none border transition-all cursor-pointer ${
                        selectedBookingId === b.id
                          ? 'bg-white border-[#1A1A1A] ring-1 ring-[#1A1A1A]'
                          : 'bg-white/40 border-[#1A1A1A]/10 hover:bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-[10px] text-on-surface-variant">
                          {b.id}
                        </span>
                        <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border ${getStatusStyle(b.status)}`}>
                          {b.status}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-lg text-ink leading-tight mb-1">
                        {b.serviceTitle}
                      </h4>
                      <p className="text-xs text-on-surface-variant">{b.date}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Details Panel (Right Column) */}
          <div className="lg:col-span-8">
            {selectedBooking ? (
              <div className="bg-white rounded-none border border-[#1A1A1A]/10 p-6 sm:p-8 shadow-none space-y-6">
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-[#1A1A1A]/10">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-sans font-semibold text-on-surface-variant">
                        Booking ID: <span className="font-mono text-ink font-bold bg-[#E8E6E1]/50 px-2 py-0.5 rounded-none">{selectedBooking.id}</span>
                      </span>
                      <span className={`text-[9px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-none border ${getStatusStyle(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                    <h3 className="text-3xl font-serif font-black text-ink tracking-tight">
                      {selectedBooking.serviceTitle}
                    </h3>
                    <p className="text-xs font-sans text-on-surface-variant/80 mt-0.5">
                      Requested on {new Date(selectedBooking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant/70">Estimated Fee</p>
                    <p className="text-3xl font-serif font-bold text-primary">{selectedBooking.price}</p>
                  </div>
                </div>

                {/* Live Stepper Tracker */}
                <div className="bg-background rounded-none p-4 border border-[#1A1A1A]/10">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-bold text-ink uppercase tracking-widest">
                      Real-time Booking Progress
                    </h4>
                    {/* Simulated Controls for Customer Interaction */}
                    {selectedBooking.status !== 'Completed' && selectedBooking.status !== 'Cancelled' && (
                      <button
                        onClick={handleAdvanceSimulation}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-sans font-bold text-white bg-primary px-3 py-1.5 rounded-none hover:bg-opacity-95 cursor-pointer"
                        title="Simulate Pro updating task status"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Simulate Progress</span>
                      </button>
                    )}
                  </div>
                  <StepperTracker currentStatus={selectedBooking.status} createdAt={selectedBooking.createdAt} />
                </div>

                {/* Live Technician Tracking Map Simulator */}
                {(selectedBooking.status === 'En Route' || selectedBooking.status === 'In Progress') && (
                  <TrackingMapSimulator
                    bookingId={selectedBooking.id}
                    status={selectedBooking.status}
                    proName={selectedBooking.assignedPro?.name || 'Technician'}
                  />
                )}

                {/* Assigned Pro Worker Details */}
                {selectedBooking.status !== 'Cancelled' && selectedBooking.assignedPro && (
                  <div className="bg-white rounded-none border border-[#1A1A1A]/10 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-none bg-[#1A1A1A] text-white font-bold flex items-center justify-center font-sans text-lg">
                        {selectedBooking.assignedPro.avatarUrl}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-bold text-ink leading-tight text-sm">
                            {selectedBooking.assignedPro.name}
                          </h4>
                          <span className="bg-[#1A1A1A]/10 text-primary text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-none">
                            Vetted Pro
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant/80 mt-1">
                          <span className="text-[#C17D50]">★</span>
                          <span>{selectedBooking.assignedPro.rating}</span>
                          <span className="text-on-surface-variant/50">• Verified Team</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsContacting(true);
                          setIsRescheduling(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8E6E1]/50 text-primary font-sans font-bold text-xs uppercase tracking-wider rounded-none hover:bg-[#E8E6E1]/80 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Contact Pro</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Job Address and Preferences Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-ink uppercase tracking-widest mb-2">
                        Location & Contact
                      </h4>
                      <div className="space-y-2 text-sm text-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#1A1A1A]/60 shrink-0" />
                          <span className="text-ink font-semibold">{selectedBooking.userName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#1A1A1A]/60 shrink-0" />
                          <span>{selectedBooking.userPhone}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-[#1A1A1A]/60 shrink-0 mt-0.5" />
                          <span>{selectedBooking.address}, {selectedBooking.zipCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-ink uppercase tracking-widest mb-2">
                        Booking Schedule
                      </h4>
                      <div className="space-y-2 text-sm text-on-surface-variant">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#1A1A1A]/60 shrink-0" />
                          <span className="text-ink font-semibold">{selectedBooking.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#1A1A1A]/60 shrink-0" />
                          <span>{selectedBooking.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Notes */}
                {selectedBooking.notes && (
                  <div className="pt-2">
                    <h4 className="text-[10px] font-bold text-ink uppercase tracking-widest mb-2">
                      Job Details
                    </h4>
                    <p className="text-xs text-on-surface-variant/80 bg-[#E8E6E1]/30 p-4 rounded-none border border-[#1A1A1A]/10 leading-relaxed italic">
                      "{selectedBooking.notes}"
                    </p>
                  </div>
                )}

                {/* Feedback & Satisfaction Review Panel */}
                {(selectedBooking.status === 'Completed' || selectedBooking.status === 'Paid') && (
                  <div className="pt-4 border-t border-[#1A1A1A]/10">
                    {ratedBookings[selectedBooking.id] ? (
                      /* Display already submitted review details */
                      <div className="bg-[#FAF9F6] border border-[#6B9080]/25 p-5">
                        <div className="flex justify-between items-start mb-2">
                          <span className="bg-[#6B9080]/10 text-[#6B9080] text-[8px] uppercase tracking-widest font-sans font-bold px-2 py-0.5">
                            My Submitted Review
                          </span>
                          <div className="flex items-center text-[#F4A261] gap-0.5">
                            {[...Array(ratedBookings[selectedBooking.id].rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-ink italic font-medium leading-relaxed">
                          "{ratedBookings[selectedBooking.id].text}"
                        </p>
                        {ratedBookings[selectedBooking.id].tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {ratedBookings[selectedBooking.id].tags.map((tag, idx) => (
                              <span key={idx} className="bg-white px-2 py-1 border border-[#1A1A1A]/5 text-[9px] font-sans font-semibold text-on-surface-variant">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/50 mt-2.5 font-sans font-semibold">
                          Submitted by {ratedBookings[selectedBooking.id].author || 'You'} • Double Verified Nestly Testimonial
                        </p>
                      </div>
                    ) : (
                      /* Render the FeedbackRatingForm */
                      <FeedbackRatingForm
                        bookingId={selectedBooking.id}
                        proName={selectedBooking.assignedPro?.name || 'Technician'}
                        onFeedbackSubmit={handleFeedbackSubmit}
                      />
                    )}
                  </div>
                )}

                {/* Interactive Dynamic Form Inlays (Reschedule or Message Pro) */}
                {isRescheduling && (
                  <motion.form
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleRescheduleSubmit}
                    className="bg-background p-4 rounded-none border border-[#1A1A1A] space-y-4 mt-4"
                  >
                    <h4 className="font-sans font-bold text-[10px] uppercase tracking-wider text-ink flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-primary" /> Reschedule Job Time
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-ink uppercase mb-1">New Date</label>
                        <input
                          type="date"
                          required
                          className="w-full bg-white border border-[#1A1A1A]/20 rounded-none px-2.5 py-1.5 text-xs text-ink focus:outline-none"
                          value={rescheduleDate}
                          onChange={(e) => setRescheduleDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-ink uppercase mb-1">New Time</label>
                        <input
                          type="time"
                          required
                          className="w-full bg-white border border-[#1A1A1A]/20 rounded-none px-2.5 py-1.5 text-xs text-ink focus:outline-none"
                          value={rescheduleTime}
                          onChange={(e) => setRescheduleTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsRescheduling(false)}
                        className="px-3 py-1 bg-white text-on-surface-variant rounded-none border border-[#1A1A1A]/10 text-xs hover:bg-[#E8E6E1]/30"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#1A1A1A] text-white rounded-none font-sans font-bold text-xs hover:bg-opacity-95"
                      >
                        Update Schedule
                      </button>
                    </div>
                  </motion.form>
                )}

                {isContacting && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-background p-4 rounded-none border border-[#1A1A1A] space-y-4 mt-4"
                  >
                    <div className="flex justify-between items-center border-b border-[#1A1A1A]/10 pb-2">
                      <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-primary" /> Direct Dispatch Chat • {selectedBooking.assignedPro?.name || 'Assigned Specialist'}
                      </h4>
                      <button
                        onClick={() => setIsContacting(false)}
                        className="text-[10px] font-bold uppercase text-on-surface-variant hover:text-ink"
                      >
                        Close Chat
                      </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                      {getChatMessagesForBooking(selectedBooking).map((msg, i) => (
                        <div
                          key={i}
                          className={`p-2.5 text-xs ${
                            msg.isPinned
                              ? 'bg-[#E8F0EA] border-l-4 border-[#6B9080] text-[#1C2B24] font-semibold'
                              : msg.sender === 'user'
                              ? 'bg-[#1C2B24] text-white ml-8'
                              : 'bg-white border border-[#1A1A1A]/10 text-ink mr-8'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1 text-[10px] opacity-75">
                            <span className="font-bold uppercase">
                              {msg.isPinned ? '📌 Pinned Location Notice' : msg.sender === 'user' ? 'You' : selectedBooking.assignedPro?.name || 'Specialist'}
                            </span>
                            <span>{msg.time}</span>
                          </div>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="space-y-3 pt-2 border-t border-[#1A1A1A]/10">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Type a dispatch instruction or message..."
                          className="flex-grow bg-white border border-[#1A1A1A]/20 rounded-none px-3 py-2 text-xs text-ink focus:outline-none"
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#1C2B24] text-white rounded-none font-sans font-bold text-xs uppercase hover:bg-opacity-95"
                        >
                          Send
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Standard Customer Action Controls */}
                <div className="flex flex-wrap justify-between items-center gap-3 pt-6 border-t border-[#1A1A1A]/10">
                  {selectedBooking.status !== 'Completed' && selectedBooking.status !== 'Cancelled' ? (
                    <>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsRescheduling(true);
                            setIsContacting(false);
                          }}
                          className="px-4 py-2 border border-[#1A1A1A]/15 text-on-surface-variant font-sans font-bold text-[10px] uppercase tracking-wider rounded-none hover:bg-[#E8E6E1]/30 transition-colors cursor-pointer"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to cancel this booking?')) {
                              onCancel(selectedBooking.id);
                            }
                          }}
                          className="px-4 py-2 border border-[#9C2C2C]/25 text-[#9C2C2C] font-sans font-bold text-[10px] uppercase tracking-wider rounded-none hover:bg-[#9C2C2C]/5 transition-colors cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-on-surface-variant/80 italic">
                      This job is {selectedBooking.status.toLowerCase()}. Actions are locked.
                    </div>
                  )}

                  <button
                    onClick={onBookNowClick}
                    className="px-4 py-2 bg-[#1A1A1A] text-white font-sans font-bold text-[10px] uppercase tracking-wider rounded-none hover:bg-opacity-90 transition-colors cursor-pointer"
                  >
                    Schedule Another Job
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-none border border-[#1A1A1A]/10 p-8 text-center text-on-surface-variant/80 italic">
                Select a booking from the list to see detailed tracking status.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
