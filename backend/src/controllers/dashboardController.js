const Product = require('../models/Product');
const Sale = require('../models/Sale');
const StockMovement = require('../models/StockMovement');

exports.getDashboardData = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const [
      totalProducts,
      products,
      sales,
      recentMovements,
      recentSales
    ] = await Promise.all([
      Product.countDocuments({ tenantId }),
      Product.find({ tenantId }),
      Sale.find({ tenantId }),
      StockMovement.find({ tenantId }).sort({ createdAt: -1 }).limit(5).populate('productId', 'name sku'),
      Sale.find({ tenantId }).sort({ createdAt: -1 }).limit(5)
    ]);

    let totalStockQuantity = 0;
    let totalStockValue = 0;
    let lowStockProducts = [];

    products.forEach(p => {
      totalStockQuantity += p.currentStock;
      totalStockValue += p.currentStock * p.purchasePrice;
      if (p.currentStock <= p.minimumStock) {
        lowStockProducts.push(p);
      }
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todaySales = 0;
    let monthlySales = 0;

    sales.forEach(s => {
      const saleDate = new Date(s.saleDate);
      if (saleDate >= today) {
        todaySales += s.total;
      }
      if (saleDate >= thisMonth) {
        monthlySales += s.total;
      }
    });

    res.json({
      success: true,
      data: {
        totalProducts,
        totalStockQuantity,
        totalStockValue,
        todaySales,
        monthlySales,
        lowStockProducts,
        recentMovements,
        recentSales
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
