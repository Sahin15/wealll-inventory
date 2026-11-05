const { getPublicPricingPayload } = require('../services/pricingService');

exports.getPublicPricing = async (req, res) => {
  try {
    const data = await getPublicPricingPayload();
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching public pricing:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
