const Product = require('../models/Product');
const Sale = require('../models/Sale');
const StockMovement = require('../models/StockMovement');
const ClassBatch = require('../models/ClassBatch');

exports.getDashboardData = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const [
      totalProducts,
      products,
      sales,
      recentMovements,
      recentSales,
      totalClasses
    ] = await Promise.all([
      Product.countDocuments({ tenantId }),
      Product.find({ tenantId }),
      Sale.find({ tenantId }),
      StockMovement.find({ tenantId }).sort({ createdAt: -1 }).limit(5).populate('productId', 'name sku'),
      Sale.find({ tenantId }).sort({ createdAt: -1 }).limit(5),
      ClassBatch.countDocuments({ tenantId })
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
    
    // 7 days ago
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

    let todaySales = 0;
    let monthlySales = 0;
    let uniqueCustomers = new Set();
    
    // Initialize chart data for the last 7 days
    const salesChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      salesChartData.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rawDate: d.getTime(), // used for matching
        amount: 0
      });
    }

    sales.forEach(s => {
      if (s.customerName) {
        uniqueCustomers.add(s.customerName.toLowerCase().trim());
      }

      const saleDate = new Date(s.saleDate);
      const normalizedSaleDate = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate()).getTime();

      if (saleDate >= today) {
        todaySales += s.total;
      }
      if (saleDate >= thisMonth) {
        monthlySales += s.total;
      }

      // Add to chart if within last 7 days
      const chartPoint = salesChartData.find(p => p.rawDate === normalizedSaleDate);
      if (chartPoint) {
        chartPoint.amount += s.total;
      }
    });

    const totalCustomers = uniqueCustomers.size;

    res.json({
      success: true,
      data: {
        totalProducts,
        totalStockQuantity,
        totalStockValue,
        todaySales,
        monthlySales,
        totalCustomers,
        totalClasses,
        salesChartData,
        lowStockProducts,
        recentMovements,
        recentSales
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
