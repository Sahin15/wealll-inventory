import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import usePublicPricing from '../../hooks/usePublicPricing';
import { formatInr, getPlanDisplayPricing } from '../../utils/planPricing';

const PricingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 h-[420px]">
        <div className="h-6 bg-slate-100 rounded w-1/2 mb-4" />
        <div className="h-4 bg-slate-100 rounded w-full mb-8" />
        <div className="h-10 bg-slate-100 rounded w-2/3 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((line) => (
            <div key={line} className="h-4 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const LandingPricingSection = () => {
  const { data, loading, error } = usePublicPricing();
  const config = data?.config;
  const plans = data?.plans || [];

  const defaultCycle = useMemo(() => {
    if (config?.isMonthlyBillingEnabled) return 'monthly';
    if (config?.isYearlyBillingEnabled) return 'yearly';
    return 'monthly';
  }, [config]);

  const [billingCycle, setBillingCycle] = useState(defaultCycle);

  useEffect(() => {
    setBillingCycle(defaultCycle);
  }, [defaultCycle]);

  const trialDays = config?.freeTrialDays ?? 14;
  const discountPct = config?.annualDiscountPercentage ?? 0;
  const showMonthlyToggle = config?.isMonthlyBillingEnabled !== false;
  const showYearlyToggle = config?.isYearlyBillingEnabled !== false;

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Simple Pricing That Grows With Your Business
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Start with a free trial. Pay monthly for flexibility or save more with yearly billing.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-700">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
              {trialDays}-Day Free Trial
            </span>
            {showMonthlyToggle && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Flexible Monthly Billing
              </span>
            )}
            {showYearlyToggle && discountPct > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                Save More with Yearly Billing
              </span>
            )}
          </div>

          {(showMonthlyToggle || showYearlyToggle) && (
            <div className="mt-8 inline-flex bg-slate-100 p-1 rounded-xl shadow-inner">
              {showMonthlyToggle && (
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`min-w-[120px] px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Monthly
                </button>
              )}
              {showYearlyToggle && (
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`min-w-[160px] px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${
                    billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {discountPct > 0 ? `Yearly - Save ${discountPct}%` : 'Yearly'}
                </button>
              )}
            </div>
          )}
        </div>

        {loading && <PricingSkeleton />}

        {!loading && error && (
          <div className="text-center text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl py-4 px-6 max-w-xl mx-auto">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <p className="text-center text-sm text-slate-500 mb-8 max-w-2xl mx-auto">
              Every business gets {trialDays} days free to explore WeAlll Inventory before choosing a subscription.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {plans.map((plan) => {
                const display = getPlanDisplayPricing(plan, billingCycle);
                const isHighlighted = plan.isRecommended;

                return (
                  <div
                    key={plan._id}
                    className={`relative rounded-2xl border flex flex-col p-6 sm:p-8 transition-all ${
                      isHighlighted
                        ? 'border-violet-500 shadow-xl shadow-violet-100 bg-white scale-[1.01]'
                        : 'border-slate-200 bg-white hover:shadow-lg hover:border-slate-300'
                    }`}
                  >
                    {(plan.badgeText || isHighlighted) && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-md whitespace-nowrap">
                        {plan.badgeText || 'Recommended'}
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{plan.description}</p>

                    <div className="mt-6 mb-2">
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-black text-slate-900">₹{formatInr(display.headlineAmount)}</span>
                        <span className="text-sm font-semibold text-slate-500 mb-1">{display.headlineSuffix}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-1">{display.billingNote}</p>

                      {billingCycle === 'yearly' && display.subline && (
                        <div className="mt-3 space-y-1">
                          <p className="text-sm font-bold text-slate-800">{display.subline}</p>
                          {display.strikeAmount > 0 && (
                            <p className="text-sm text-slate-400 line-through">₹{formatInr(display.strikeAmount)}</p>
                          )}
                          {display.savingsLabel && (
                            <p className="text-xs font-bold text-emerald-600">{display.savingsLabel}</p>
                          )}
                          {display.savingsAmountLabel && (
                            <p className="text-xs font-semibold text-emerald-700">{display.savingsAmountLabel}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2.5 my-6 flex-1">
                      {plan.features?.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/register"
                      className={`w-full text-center py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                        isHighlighted
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-95 shadow-md'
                          : 'bg-slate-900 text-white hover:bg-indigo-600'
                      }`}
                    >
                      Start {trialDays}-Day Free Trial
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default LandingPricingSection;
