import React from 'react';
import wealllFullLogo from '../../assets/wealll-full-logo-cropped.png';

const BrandFooter = ({ className = '' }) => {
  return (
    <footer className={`w-full pt-4 pb-3 sm:pb-4 px-4 flex flex-col items-center justify-center gap-1.5 text-center select-none ${className}`}>
      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
        Powered by
      </span>
      <img 
        src={wealllFullLogo} 
        alt="WeAlll Inventory Management System" 
        width="140"
        height="28"
        loading="lazy"
        decoding="async"
        className="h-6 sm:h-7 w-auto object-contain opacity-85 hover:opacity-100 transition-opacity" 
      />
      <p className="text-[11px] text-slate-400 font-medium">
        Smart Inventory. Stronger Business.
      </p>
    </footer>
  );
};

export default BrandFooter;
