/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookingStatus } from '../types';

interface StepperTrackerProps {
  currentStatus: BookingStatus;
  interactive?: boolean;
  onStepClick?: (status: BookingStatus) => void;
  createdAt?: string;
}

// Stage 1 (Received / Request): A single tiny leaf bud starting to point up
const Stage1Bud = ({ active, completed }: { active: boolean; completed: boolean }) => (
  <svg viewBox="0 0 40 40" className="w-12 h-12 transition-all duration-300">
    <circle cx="20" cy="20" r="14" className={`${completed || active ? 'fill-mint-cream stroke-jungle-teal' : 'fill-white stroke-jungle-teal/20'} stroke-[1.5] transition-all`} />
    <path
      d="M20,28 C20,28 19,23 21,20 Q23,17 25,16 Q21,18 19,21 Q17,24 20,28"
      fill={completed || active ? "#6B9080" : "#A4C3B2/20"}
      stroke={completed || active ? "#6B9080" : "#A4C3B2"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all"
    />
    <circle cx="25" cy="16" r="2" fill={completed || active ? "#F4A261" : "#A4C3B2"} />
  </svg>
);

// Stage 2 (Assigned): Two small leaves starting to unfold
const Stage2Leaves = ({ active, completed }: { active: boolean; completed: boolean }) => (
  <svg viewBox="0 0 40 40" className="w-12 h-12 transition-all duration-300">
    <circle cx="20" cy="20" r="14" className={`${completed || active ? 'fill-mint-cream stroke-jungle-teal' : 'fill-white stroke-jungle-teal/20'} stroke-[1.5] transition-all`} />
    <path d="M20,28 Q20,20 20,14" stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Left leaf */}
    <path
      d="M20,22 Q14,19 12,14 Q18,16 20,22"
      fill={completed || active ? "#6B9080" : "none"}
      stroke={completed || active ? "#6B9080" : "#A4C3B2"}
      strokeWidth="1.2"
    />
    {/* Right leaf */}
    <path
      d="M20,18 Q26,15 28,11 Q22,12 20,18"
      fill={completed || active ? "#A4C3B2" : "none"}
      stroke={completed || active ? "#A4C3B2" : "#CCE3DE"}
      strokeWidth="1.2"
    />
  </svg>
);

// Stage 3 (En Route): Twig with unfolding leaves and travel spark
const Stage3EnRoute = ({ active, completed }: { active: boolean; completed: boolean }) => (
  <svg viewBox="0 0 40 40" className="w-12 h-12 transition-all duration-300">
    <circle cx="20" cy="20" r="14" className={`${completed || active ? 'fill-mint-cream stroke-jungle-teal' : 'fill-white stroke-jungle-teal/20'} stroke-[1.5] transition-all`} />
    <path d="M20,28 Q20,18 24,12" stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M20,23 Q13,21 11,16 Q17,17 20,23" fill={completed || active ? "#6B9080" : "none"} stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="1.2" />
    <path d="M21,18 Q27,15 29,10 Q23,12 21,18" fill={completed || active ? "#A4C3B2" : "none"} stroke={completed || active ? "#A4C3B2" : "#CCE3DE"} strokeWidth="1.2" />
    {active && (
      <path d="M24,12 L26,14 L28,12 L26,10 Z" fill="#F4A261" className="animate-pulse" />
    )}
  </svg>
);

// Stage 4 (In Progress): Larger sprig with multiple growing leaves
const Stage4InProgress = ({ active, completed }: { active: boolean; completed: boolean }) => (
  <svg viewBox="0 0 40 40" className="w-12 h-12 transition-all duration-300">
    <circle cx="20" cy="20" r="14" className={`${completed || active ? 'fill-mint-cream stroke-jungle-teal' : 'fill-white stroke-jungle-teal/20'} stroke-[1.5] transition-all`} />
    <path d="M20,28 C20,19 17,14 20,8" stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M20,21 C12,18 10,13 10,13 Q15,15 20,21" fill={completed || active ? "#6B9080" : "none"} stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="1.2" />
    <path d="M20,16 C28,13 30,8 30,8 Q25,10 20,16" fill={completed || active ? "#A4C3B2" : "none"} stroke={completed || active ? "#A4C3B2" : "#CCE3DE"} strokeWidth="1.2" />
    <path d="M19,13 C14,10 13,6 13,6 Q16,8 19,13" fill={completed || active ? "#6B9080" : "none"} stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="1" />
  </svg>
);

// Stage 5 (Completed): Beautiful bloom with floral accents
const Stage5Completed = ({ active, completed }: { active: boolean; completed: boolean }) => (
  <svg viewBox="0 0 40 40" className="w-12 h-12 transition-all duration-300">
    <circle cx="20" cy="20" r="14" className={`${completed || active ? 'fill-mint-cream stroke-jungle-teal' : 'fill-white stroke-jungle-teal/20'} stroke-[1.5] transition-all`} />
    <path d="M20,28 C20,18 20,12 20,6" stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M20,22 C11,19 8,12 8,12 Q15,14 20,22" fill={completed || active ? "#6B9080" : "none"} stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="1.2" />
    <path d="M20,17 C29,14 32,8 32,8 Q25,10 20,17" fill={completed || active ? "#A4C3B2" : "none"} stroke={completed || active ? "#A4C3B2" : "#CCE3DE"} strokeWidth="1.2" />
    <path d="M20,12 C13,9 11,4 11,4 Q16,6 20,12" fill={completed || active ? "#6B9080" : "none"} stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="1.2" />
    <circle cx="20" cy="12" r="3.5" fill="#F4A261" className="animate-pulse" />
  </svg>
);

// Stage 6 (Paid): Fully bloomed, rich botanical branch
const Stage6Paid = ({ active, completed }: { active: boolean; completed: boolean }) => (
  <svg viewBox="0 0 40 40" className="w-12 h-12 transition-all duration-300">
    <circle cx="20" cy="20" r="14" className={`${completed || active ? 'fill-mint-cream stroke-jungle-teal' : 'fill-white stroke-jungle-teal/20'} stroke-[1.5] transition-all`} />
    <path d="M20,28 C20,16 20,10 20,6" stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M20,22 C9,20 6,12 6,12 Q14,14 20,22" fill={completed || active ? "#6B9080" : "none"} stroke={completed || active ? "#6B9080" : "#A4C3B2"} strokeWidth="1.2" />
    <path d="M20,17 C30,15 34,7 34,7 Q25,9 20,17" fill={completed || active ? "#A4C3B2" : "none"} stroke={completed || active ? "#A4C3B2" : "#CCE3DE"} strokeWidth="1.2" />
    <circle cx="20" cy="10" r="4" fill="#F4A261" />
    <circle cx="11" cy="17" r="2.5" fill="#F4A261" />
    <circle cx="29" cy="14" r="2.5" fill="#F4A261" />
  </svg>
);

export default function StepperTracker({
  currentStatus,
  interactive = false,
  onStepClick,
  createdAt,
}: StepperTrackerProps) {
  // Define Nestly's 6 stages exactly
  const steps: {
    index: number;
    id: BookingStatus;
    title: string;
    desc: string;
    icon: (active: boolean, completed: boolean) => React.ReactNode;
  }[] = [
    {
      index: 1,
      id: 'Request',
      title: 'Received',
      desc: 'Booking requested by client',
      icon: (active, completed) => <Stage1Bud active={active} completed={completed} />,
    },
    {
      index: 2,
      id: 'Assigned',
      title: 'Assigned',
      desc: 'Internal Pro assigned and vetted',
      icon: (active, completed) => <Stage2Leaves active={active} completed={completed} />,
    },
    {
      index: 3,
      id: 'En Route',
      title: currentStatus === 'Arrived' ? 'Arrived' : 'En Route',
      desc: currentStatus === 'Arrived' ? 'Specialist has arrived at your location' : 'Pro is traveling to your home',
      icon: (active, completed) => <Stage3EnRoute active={active} completed={completed} />,
    },
    {
      index: 4,
      id: 'In Progress',
      title: 'In Progress',
      desc: 'Service is active and under guarantee',
      icon: (active, completed) => <Stage4InProgress active={active} completed={completed} />,
    },
    {
      index: 5,
      id: 'Completed',
      title: 'Completed',
      desc: 'Service checked and approved',
      icon: (active, completed) => <Stage5Completed active={active} completed={completed} />,
    },
    {
      index: 6,
      id: 'Paid',
      title: 'Paid',
      desc: 'Securely processed & receipt sent',
      icon: (active, completed) => <Stage6Paid active={active} completed={completed} />,
    },
  ];

  const getStatusIndex = (status: BookingStatus): number => {
    switch (status) {
      case 'Request':
        return 1;
      case 'Assigned':
        return 2;
      case 'En Route':
      case 'Arrived':
        return 3;
      case 'In Progress':
        return 4;
      case 'Completed':
        return 5;
      case 'Paid':
        return 6;
      case 'Cancelled':
        return 0;
      default:
        return 1;
    }
  };

  const currentIndex = getStatusIndex(currentStatus);

  // Parse or compute precise IBM Plex Mono utility timestamps based on createdAt
  const getTimestampForStep = (stepIndex: number): string => {
    const baseDate = createdAt ? new Date(createdAt) : new Date();
    
    // Add offset based on step to make them realistic
    const addMinutes = (date: Date, mins: number) => {
      return new Date(date.getTime() + mins * 60000);
    };

    const formatTime = (date: Date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minStr} ${ampm}`;
    };

    if (stepIndex === 1) {
      return formatTime(baseDate);
    } else if (stepIndex === 2) {
      return formatTime(addMinutes(baseDate, 4));
    } else if (stepIndex === 3) {
      return formatTime(addMinutes(baseDate, 38));
    } else if (stepIndex === 4) {
      return currentIndex >= 4 ? formatTime(addMinutes(baseDate, 75)) : 'pending';
    } else if (stepIndex === 5) {
      return currentIndex >= 5 ? formatTime(addMinutes(baseDate, 130)) : 'pending';
    } else if (stepIndex === 6) {
      return currentIndex >= 6 ? formatTime(addMinutes(baseDate, 135)) : 'pending';
    }
    return 'pending';
  };

  return (
    <div className="relative w-full py-8 px-2">
      {/* Botanical Connecting Branch Line */}
      <div className="hidden md:block absolute top-[44px] left-[8%] right-[8%] h-[2px] bg-jungle-teal/10 z-0">
        <div
          className="h-full bg-jungle-teal transition-all duration-700 ease-in-out"
          style={{
            width: `${currentIndex <= 0 ? 0 : ((currentIndex - 1) / 5) * 100}%`,
          }}
        />
      </div>

      {/* Steps Container */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-2">
        {steps.map((step) => {
          const isCompleted = currentIndex > step.index || currentStatus === 'Paid';
          const isActive = currentIndex === step.index;
          const isUpcoming = currentIndex < step.index && currentStatus !== 'Paid';

          return (
            <div
              key={step.id}
              onClick={() => interactive && onStepClick && onStepClick(step.id)}
              className={`flex flex-col items-center text-center select-none p-2 ${
                interactive ? 'cursor-pointer group hover:scale-[1.02] transition-transform' : ''
              }`}
            >
              {/* Leaf Icon Node */}
              <div className="mb-2 relative">
                {step.icon(isActive, isCompleted)}
                
                {/* Active pulsating beacon ring */}
                {isActive && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warm-tangerine opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-warm-tangerine"></span>
                  </span>
                )}
              </div>

              {/* Step Title in Manrope (Sans) */}
              <h4 className={`font-sans text-[11px] uppercase tracking-wider font-bold ${
                isActive ? 'text-ink' : isCompleted ? 'text-jungle-teal' : 'text-jungle-teal/40'
              }`}>
                {step.title}
              </h4>

              {/* Step Factual Timestamp in IBM Plex Mono (Factual utility) */}
              <span className={`font-mono text-[9px] uppercase tracking-wide mt-1 px-1.5 py-0.5 ${
                isActive || isCompleted ? 'text-ink/70 bg-mint-cream/80' : 'text-jungle-teal/30 bg-transparent'
              }`}>
                {getTimestampForStep(step.index)}
              </span>

              {/* Description helper text (on desktop only) */}
              <p className="hidden md:block font-sans text-[10px] text-ink/60 mt-1.5 leading-snug max-w-[120px] mx-auto">
                {step.desc}
              </p>

              {interactive && (
                <span className="opacity-0 group-hover:opacity-100 mt-2 text-[8px] uppercase tracking-wider bg-ink text-white px-1 py-0.5 rounded-none transition-opacity">
                  Set State
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Cancelled Alert State */}
      {currentStatus === 'Cancelled' && (
        <div className="mt-6 text-center text-[10px] uppercase tracking-widest font-bold text-emergency-red bg-mint-cream border border-emergency-red/20 py-3 rounded-none max-w-sm mx-auto">
          🚨 This booking is currently Cancelled.
        </div>
      )}
    </div>
  );
}
