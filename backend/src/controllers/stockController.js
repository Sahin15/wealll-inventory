const StockMovement = require('../models/StockMovement');

exports.getStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find({ tenantId: req.user.tenantId })
      .populate('productId', 'name sku')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: movements });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
