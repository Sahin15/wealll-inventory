import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * AdaptiveSheet:
 * - On Mobile (< md): Slides up from bottom as an ergonomic bottom sheet with drag indicator, sticky header, scrollable body, and sticky actions.
 * - On Desktop (>= md): Renders as an elegant centered dialog with backdrop blur.
 */
const AdaptiveSheet = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
  showClose = true,
}) => {
  // Lock background scroll when sheet/modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto md:flex md:items-center md:justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container: Bottom sheet on mobile, centered modal on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="adaptive-sheet-title"
        className={`fixed inset-x-0 bottom-0 md:static z-50 w-full ${maxWidth} bg-white rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] md:max-h-[85vh] transition-transform duration-300 ease-out`}
      >
        {/* Mobile Drag Pill Indicator */}
        <div className="md:hidden flex items-center justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 md:py-4 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 id="adaptive-sheet-title" className="text-base md:text-lg font-bold text-slate-900 truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>
            )}
          </div>
          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 -mr-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-full transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center tap-highlight-transparent"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body (Momentum Scrollable) */}
        <div className="flex-1 overflow-y-auto momentum-scroll px-5 py-4 space-y-4">
          {children}
        </div>

        {/* Optional Sticky Footer / Action Bar */}
        {footer && (
          <div className="px-5 py-3.5 md:py-4 border-t border-slate-100 bg-slate-50/80 rounded-b-none md:rounded-b-2xl shrink-0 pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdaptiveSheet;
