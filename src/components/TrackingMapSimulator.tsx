/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Truck, 
  Home, 
  Battery, 
  Wifi, 
  Compass, 
  Clock, 
  Radio, 
  Play, 
  Navigation,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface TrackingMapSimulatorProps {
  bookingId: string;
  status: string;
  proName: string;
}

interface TelemetryLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

export default function TrackingMapSimulator({
  bookingId,
  status,
  proName
}: TrackingMapSimulatorProps) {
  const [progress, setProgress] = useState(0.2); // Range 0 to 1
  const [speed, setSpeed] = useState(32); // MPH
  const [eta, setEta] = useState(15); // Minutes
  const [signal, setSignal] = useState(98); // Percentage
  const [battery, setBattery] = useState(88); // Percentage
  const [pingPulse, setPingPulse] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Initial helper to generate timestamps
  const getFormattedTime = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };

  // Populate initial logs depending on status
  useEffect(() => {
    const initialLogs: TelemetryLog[] = [
      { timestamp: getFormattedTime(), message: `Nestly dispatch node initialized for Booking #${bookingId}`, type: 'info' },
    ];

    if (status === 'En Route') {
      initialLogs.push({ timestamp: getFormattedTime(), message: `${proName.split(' ')[0]} accepted dispatch and is departing the service hub.`, type: 'info' });
      initialLogs.push({ timestamp: getFormattedTime(), message: `Optimal route locked via Nestly Nav. Distance: 4.8 miles.`, type: 'success' });
    } else if (status === 'In Progress') {
      initialLogs.push({ timestamp: getFormattedTime(), message: `${proName.split(' ')[0]} has arrived at destination and initialized workspace.`, type: 'success' });
      initialLogs.push({ timestamp: getFormattedTime(), message: `Safety audit complete. Tools calibrated. Diagnostic scan: 100% ready.`, type: 'info' });
    }

    setTelemetryLogs(initialLogs);
    setProgress(status === 'In Progress' ? 1.0 : 0.2);
    setSpeed(status === 'In Progress' ? 0 : 32);
    setEta(status === 'In Progress' ? 0 : 15);
  }, [bookingId, status, proName]);

  // Handle automatic telemetry log scrolling
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [telemetryLogs]);

  // Simulate active movement when "En Route"
  useEffect(() => {
    if (status !== 'En Route') return;

    const timer = setInterval(() => {
      // Advance progress slightly
      setProgress((prev) => {
        if (prev >= 0.95) {
          clearInterval(timer);
          return 0.95;
        }
        const nextProgress = prev + 0.05;
        
        // Add a live log periodically
        const currentEta = Math.max(1, Math.round(15 * (1 - nextProgress)));
        setEta(currentEta);

        // Fluctuate speed & other telemetry
        setSpeed(Math.floor(22 + Math.random() * 16));
        setSignal(Math.floor(92 + Math.random() * 8));
        setBattery((b) => Math.max(10, b - 1));

        // Generate situational logging message
        let msg = '';
        let logType: 'info' | 'success' | 'warn' = 'info';
        if (nextProgress > 0.3 && nextProgress <= 0.4) {
          msg = 'Vehicle traveling northbound on Arterial Roadway.';
        } else if (nextProgress > 0.5 && nextProgress <= 0.6) {
          msg = 'Minor intersection delay. Rerouting tool: green-wave active.';
          logType = 'warn';
        } else if (nextProgress > 0.7 && nextProgress <= 0.8) {
          msg = 'Entering neighborhood sector. ETA decreased to ' + currentEta + ' mins.';
          logType = 'success';
        } else if (nextProgress > 0.9) {
          msg = 'Technician is approaching your block. Prepare entry instructions.';
          logType = 'success';
        }

        if (msg) {
          setTelemetryLogs((prevLogs) => [
            ...prevLogs,
            { timestamp: getFormattedTime(), message: msg, type: logType }
          ]);
        }

        return nextProgress;
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [status]);

  const triggerPingPulse = () => {
    setPingPulse(true);
    setTimeout(() => setPingPulse(false), 800);
    
    // Manual telemetry interaction
    const manualLogs: string[] = [
      'Forced telemetry telemetry refresh.',
      'Active GPS ping signal returned: latency 24ms.',
      'Technician velocity verified.',
      'Optimizing signal channel broadcast.'
    ];
    const msg = manualLogs[Math.floor(Math.random() * manualLogs.length)];
    
    setTelemetryLogs((prev) => [
      ...prev,
      { timestamp: getFormattedTime(), message: `[PING] ${msg}`, type: 'info' }
    ]);

    // Give a small progress boost if "En Route"
    if (status === 'En Route') {
      setProgress((prev) => {
        const next = Math.min(0.98, prev + 0.04);
        setEta(Math.max(1, Math.round(15 * (1 - next))));
        return next;
      });
    }
  };

  // Calculate truck icon coordinate position along a simulated visual path
  // Custom styled path is an S-curve on a 400x180 field
  // Start: (40, 140) -> Control 1: (150, 40) -> Control 2: (250, 140) -> End: (360, 40)
  const getCoordinatesOnPath = (t: number) => {
    const x0 = 40, y0 = 130;
    const x1 = 150, y1 = 30;
    const x2 = 250, y2 = 150;
    const x3 = 355, y3 = 45;

    // Bezier formula
    const mt = 1 - t;
    const x = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
    const y = mt * mt * mt * y0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * y3;

    return { x, y };
  };

  const currentCoords = getCoordinatesOnPath(progress);

  return (
    <div className="bg-white border border-[#1A1A1A]/10 rounded-none overflow-hidden my-6">
      <div className="bg-[#1C2B24] text-white p-4 flex justify-between items-center border-b border-[#1A1A1A]/10">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 text-[#F4A261] ${status === 'En Route' ? 'animate-pulse' : ''}`} />
          <span className="font-sans text-[10px] uppercase tracking-widest font-bold">
            Live Dispatch & Route Telemetry
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[#FAF9F6]/60">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Feed: Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Visual Map Area */}
        <div className="md:col-span-7 bg-[#FAF9F6] p-4 relative min-h-[220px] flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-[#1A1A1A]/10 select-none">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: `radial-gradient(#1C2B24 1px, transparent 1px)`,
            backgroundSize: '16px 16px'
          }}></div>

          {/* Simulated Map Streets */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            {/* Main Road Route S-Curve */}
            <path
              d="M 40 130 C 150 30, 250 150, 355 45"
              fill="none"
              stroke="#E8E6E1"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Completed Segment Highlight */}
            <path
              d="M 40 130 C 150 30, 250 150, 355 45"
              fill="none"
              stroke="#6B9080"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="400"
              strokeDashoffset={400 - progress * 400}
              className="transition-all duration-1000 ease-out"
            />
            {/* Neighborhood intersecting streets */}
            <line x1="80" y1="20" x2="80" y2="180" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="4 4" opacity="0.08" />
            <line x1="200" y1="20" x2="200" y2="180" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="4 4" opacity="0.08" />
            <line x1="300" y1="20" x2="300" y2="180" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="4 4" opacity="0.08" />
            <line x1="20" y1="80" x2="380" y2="80" stroke="#1A1A1A" strokeWidth="1" strokeDasharray="4 4" opacity="0.08" />
          </svg>

          {/* Map Landmarks */}
          {/* Dispatch Depot / Start */}
          <div className="absolute" style={{ left: '25px', top: '145px' }}>
            <div className="flex flex-col items-center">
              <div className="w-5 h-5 bg-[#E8E6E1] border border-[#1A1A1A]/10 flex items-center justify-center text-[8px] font-bold text-ink">
                H
              </div>
              <span className="font-sans text-[8px] uppercase tracking-wider text-on-surface-variant/70 mt-1">Depot</span>
            </div>
          </div>

          {/* Customer House / End */}
          <div className="absolute" style={{ left: '345px', top: '10px' }}>
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 bg-[#1C2B24] border border-[#FAF9F6] text-white flex items-center justify-center shadow-sm relative">
                <Home className="w-3.5 h-3.5" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="font-sans text-[8px] uppercase tracking-widest font-bold text-ink mt-1">Home</span>
            </div>
          </div>

          {/* Vetted Specialist Vehicle Marker */}
          <div 
            className="absolute transition-all duration-1000 ease-out z-10"
            style={{ 
              left: `${currentCoords.x - 16}px`, 
              top: `${currentCoords.y - 16}px` 
            }}
          >
            <div className="relative">
              {/* Pulse waves */}
              <AnimatePresence>
                {pingPulse && (
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 bg-[#F4A261] rounded-full pointer-events-none"
                  ></motion.div>
                )}
              </AnimatePresence>

              {status === 'En Route' ? (
                <div className="w-8 h-8 bg-[#F4A261] border border-white text-ink shadow-md flex items-center justify-center rounded-full hover:scale-105 transition-transform cursor-pointer" onClick={triggerPingPulse}>
                  <Truck className="w-4 h-4 text-[#1C2B24]" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-[#6B9080] border border-white text-white shadow-md flex items-center justify-center rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Map HUD overlays */}
          <div className="relative z-10 bg-white/90 backdrop-blur-xs border border-[#1A1A1A]/10 p-2.5 max-w-[170px] mt-auto">
            <p className="font-sans text-[8px] uppercase tracking-widest text-[#1C2B24] font-bold">
              Dispatch Sector 4
            </p>
            <p className="font-serif text-[10px] text-on-surface-variant/80 mt-0.5 italic leading-tight">
              {status === 'En Route' 
                ? `${proName.split(' ')[0]} is driving to you.` 
                : `${proName.split(' ')[0]} has arrived and is working.`
              }
            </p>
          </div>
        </div>

        {/* Live Diagnostics & Telemetry Log Screen */}
        <div className="md:col-span-5 p-4 flex flex-col justify-between bg-white space-y-4">
          
          {/* Diagnostic Metrics Grid */}
          <div>
            <span className="text-[8px] uppercase tracking-widest text-on-surface-variant/60 font-sans font-bold block mb-2">
              Diagnostic Feed
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#FAF9F6] border border-[#1A1A1A]/5 p-2 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <div>
                  <p className="text-[7px] uppercase tracking-wider text-on-surface-variant/60">ETA Duration</p>
                  <p className="font-serif text-xs font-bold text-ink">
                    {status === 'In Progress' ? 'Arrived' : `${eta} mins`}
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#1A1A1A]/5 p-2 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-primary shrink-0" />
                <div>
                  <p className="text-[7px] uppercase tracking-wider text-on-surface-variant/60">Cruising Speed</p>
                  <p className="font-mono text-xs font-bold text-ink">
                    {speed} MPH
                  </p>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#1A1A1A]/5 p-2 flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-[#6B9080] shrink-0" />
                <div>
                  <p className="text-[7px] uppercase tracking-wider text-on-surface-variant/60">Link Quality</p>
                  <p className="font-mono text-xs font-bold text-ink">{signal}%</p>
                </div>
              </div>

              <div className="bg-[#FAF9F6] border border-[#1A1A1A]/5 p-2 flex items-center gap-2">
                <Battery className="w-3.5 h-3.5 text-[#6B9080] shrink-0" />
                <div>
                  <p className="text-[7px] uppercase tracking-wider text-on-surface-variant/60">Device Charge</p>
                  <p className="font-mono text-xs font-bold text-ink">{battery}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Telemetry Ticker Console */}
          <div className="flex-grow flex flex-col min-h-[90px]">
            <span className="text-[8px] uppercase tracking-widest text-on-surface-variant/60 font-sans font-bold block mb-1">
              Active Console Stream
            </span>
            <div 
              ref={logContainerRef}
              className="bg-[#1A1C1A] text-[#A3B899] font-mono text-[9px] p-2.5 h-[95px] overflow-y-auto space-y-1.5 border border-[#1A1A1A]/10"
            >
              {telemetryLogs.map((log, idx) => (
                <div key={idx} className="leading-normal flex items-start gap-1">
                  <span className="text-white/40 select-none">[{log.timestamp}]</span>
                  <span className={
                    log.type === 'success' 
                      ? 'text-emerald-400' 
                      : log.type === 'warn' 
                        ? 'text-amber-400' 
                        : 'text-on-surface-variant'
                  }>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Ping Controller */}
          <button
            onClick={triggerPingPulse}
            disabled={status !== 'En Route'}
            className="w-full bg-[#1C2B24] text-white hover:bg-opacity-95 disabled:bg-[#FAF9F6] disabled:text-on-surface-variant/40 disabled:border-[#1A1A1A]/10 border border-transparent font-sans font-bold text-[10px] uppercase tracking-widest py-2 rounded-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>Simulate Signal GPS Ping</span>
          </button>
        </div>
      </div>
    </div>
  );
}
