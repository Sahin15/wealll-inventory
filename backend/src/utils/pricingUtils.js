/**
 * Central annual pricing calculation (INR, whole rupees).
 * Source of truth for discounted yearly amounts across API responses.
 */
function calculateAnnualPricing(monthlyPrice, annualDiscountPercentage = 0) {
  const monthly = Math.max(0, Number(monthlyPrice) || 0);
  const discountPct = Math.min(100, Math.max(0, Number(annualDiscountPercentage) || 0));

  const regularAnnualPrice = monthly * 12;
  const discountAmount = Math.round(regularAnnualPrice * (discountPct / 100));
  const discountedAnnualPrice = regularAnnualPrice - discountAmount;
  const effectiveMonthlyPrice = discountedAnnualPrice > 0 ? Math.round(discountedAnnualPrice / 12) : 0;

  return {
    regularAnnualPrice,
    discountAmount,
    discountedAnnualPrice,
    effectiveMonthlyPrice,
    annualDiscountPercentage: discountPct,
  };
}

function resolvePlanChargeAmount(plan, billingCycle, pricingConfig) {
  const monthlyPrice = Math.max(0, Number(plan.monthlyPrice) || 0);
  if (billingCycle === 'yearly') {
    const annual = calculateAnnualPricing(monthlyPrice, pricingConfig.annualDiscountPercentage);
    return annual.discountedAnnualPrice;
  }
  return monthlyPrice;
}

module.exports = {
  calculateAnnualPricing,
  resolvePlanChargeAmount,
};
