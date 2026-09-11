import React from 'react';

/**
 * SegmentedTabs:
 * Native mobile-app segmented pill control for switching views or filter states.
 */
const SegmentedTabs = ({
  tabs = [],
  activeTab,
  onChange,
  size = 'md', // 'sm' | 'md'
  className = '',
}) => {
  const isSm = size === 'sm';

  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-full overflow-x-auto no-scrollbar tap-highlight-transparent ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 min-w-[max-content] flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all duration-150 select-none ${
              isSm ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs md:text-sm min-h-[38px]'
            } ${
              isActive
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 active:bg-slate-200/50'
            }`}
          >
            {Icon && (
              <Icon
                className={`shrink-0 ${isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
            )}
            <span className="truncate">{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedTabs;
