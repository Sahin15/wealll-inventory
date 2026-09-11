import React, { useState, useEffect } from 'react';
import wealllFullLogo from '../../assets/wealll-full-logo-cropped.png';

/**
 * BrandSplash / BrandLoader:
 * Full-screen, responsive, brand-aligned loading screen for Mobile (PWA) and Desktop Web.
 * Displays the full WeAlll Inventory logo, official tagline, and animated progress indicator.
 * Guarantees a polished, visible branding experience with progressive status updates.
 */
const BrandSplash = ({ 
  message = 'Signing you in to your workspace...', 
  tagline = 'Smart Inventory. Stronger Business.',
  duration = 2200
}) => {
  const [progress, setProgress] = useState(20);
  const [currentStatus, setCurrentStatus] = useState('Verifying credentials...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(58);
      setCurrentStatus('Syncing workspace & inventory...');
    }, duration * 0.35);

    const t2 = setTimeout(() => {
      setProgress(88);
      setCurrentStatus('Preparing your dashboard...');
    }, duration * 0.7);

    const t3 = setTimeout(() => {
      setProgress(100);
      setCurrentStatus('Ready! Launching workspace...');
    }, duration * 0.95);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [duration]);

  return (
    <div 
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/60 to-slate-100 text-slate-900 px-6 font-sans overflow-hidden select-none animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-label="Loading WeAlll Inventory"
    >
      {/* Ambient background glows */}
      <div 
        className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div 
        className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-violet-400/10 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Elevated Brand Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/80 max-w-sm w-full flex flex-col items-center text-center transition-all duration-300 animate-in zoom-in-95 duration-200">
        {/* Full WeAlll Inventory Logo with gentle floating pulse */}
        <div className="py-2 flex items-center justify-center w-full">
          <img
            src={wealllFullLogo}
            alt="WeAlll Inventory Management System"
            className="h-14 sm:h-16 w-auto object-contain animate-pulse-subtle"
          />
        </div>

        {/* Official Tagline */}
        <p className="text-sm font-semibold tracking-wide text-slate-700 mt-4">
          {tagline}
        </p>

        {/* Dynamic Context Message */}
        <p className="text-xs font-semibold text-indigo-600 mt-2 min-h-[18px] transition-all duration-300">
          {currentStatus || message}
        </p>

        {/* Progressive Bar */}
        <div 
          className="w-52 sm:w-60 h-2 bg-slate-100 rounded-full overflow-hidden relative mt-5 border border-slate-200/70 shadow-inner"
          aria-hidden="true"
        >
          <div 
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/25 animate-progress-shimmer" />
          </div>
        </div>

        {/* Secure Cloud Sync Indicator */}
        <div className="mt-5 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Cloud Sync Active</span>
        </div>
      </div>
    </div>
  );
};

export default BrandSplash;
