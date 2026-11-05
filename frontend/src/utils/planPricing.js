export function formatInr(amount) {
  const value = Math.round(Number(amount) || 0);
  return value.toLocaleString('en-IN');
}

export function getPlanDisplayPricing(plan, billingCycle) {
  const pricing = plan?.pricing;
  if (!pricing) {
    const monthly = Number(plan?.monthlyPrice) || 0;
    if (billingCycle === 'yearly') {
      return {
        headlineAmount: monthly,
        headlineSuffix: '/month',
        subline: null,
        strikeAmount: null,
        savingsLabel: null,
        billingNote: 'Billed annually',
      };
    }
    return {
      headlineAmount: monthly,
      headlineSuffix: '/month',
      subline: null,
      strikeAmount: null,
      savingsLabel: null,
      billingNote: 'Billed monthly',
    };
  }

  if (billingCycle === 'yearly') {
    const yearly = pricing.billing.yearly;
    return {
      headlineAmount: yearly.effectiveMonthlyPrice,
      headlineSuffix: '/month',
      subline: `₹${formatInr(yearly.amount)}/year`,
      strikeAmount: yearly.regularAnnualPrice,
      savingsLabel: `Save ${yearly.annualDiscountPercentage}%`,
      savingsAmountLabel: yearly.discountAmount > 0 ? `Save ₹${formatInr(yearly.discountAmount)}/year` : null,
      billingNote: 'Billed annually',
    };
  }

  return {
    headlineAmount: pricing.monthlyPrice,
    headlineSuffix: '/month',
    subline: null,
    strikeAmount: null,
    savingsLabel: null,
    billingNote: 'Billed monthly',
  };
}

export function getChargeAmount(plan, billingCycle) {
  if (!plan?.pricing) {
    return billingCycle === 'yearly' ? plan?.yearlyPrice : plan?.monthlyPrice;
  }
  return billingCycle === 'yearly'
    ? plan.pricing.billing.yearly.amount
    : plan.pricing.billing.monthly.amount;
}
