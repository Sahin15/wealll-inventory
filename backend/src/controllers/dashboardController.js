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
      allBatches
    ] = await Promise.all([
      Product.countDocuments({ tenantId }),
      Product.find({ tenantId }).populate('categoryId', 'name color'),
      Sale.find({ tenantId }).sort({ createdAt: -1 }),
      StockMovement.find({ tenantId })
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('productId', 'name sku currentStock unit'),
      Sale.find({ tenantId }).sort({ createdAt: -1 }).limit(6),
      ClassBatch.find({ tenantId }).sort({ date: 1 })
    ]);

    const totalClasses = allBatches.length;

    let totalStockQuantity = 0;
    let totalStockValue = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let healthyStockCount = 0;
    let lowStockProducts = [];

    products.forEach(p => {
      const stock = Number(p.currentStock) || 0;
      const min = Number(p.minimumStock) || 0;
      const price = Number(p.purchasePrice) || 0;

      totalStockQuantity += stock;
      totalStockValue += stock * price;

      if (stock === 0) {
        outOfStockCount++;
        lowStockProducts.push(p);
      } else if (stock <= min) {
        lowStockCount++;
        lowStockProducts.push(p);
      } else {
        healthyStockCount++;
      }
    });

    // Sort low stock products by most critical (lowest stock percentage)
    lowStockProducts.sort((a, b) => {
      const ratioA = (a.currentStock || 0) / Math.max(a.minimumStock || 1, 1);
      const ratioB = (b.currentStock || 0) / Math.max(b.minimumStock || 1, 1);
      return ratioA - ratioB;
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todaySales = 0;
    let todayOrders = 0;
    let monthlySales = 0;
    let monthlyOrders = 0;
    let allTimeSales = 0;
    let totalSalesCount = 0;
    let uniqueCustomers = new Set();

    sales.forEach(s => {
      if (s.customerName) {
        uniqueCustomers.add(s.customerName.toLowerCase().trim());
      }

      if (s.status === 'VOIDED') return;

      const saleTotal = Number(s.total) || 0;
      allTimeSales += saleTotal;
      totalSalesCount++;

      const saleDate = new Date(s.saleDate || s.createdAt);

      if (saleDate >= today) {
        todaySales += saleTotal;
        todayOrders++;
      }
      if (saleDate >= thisMonth) {
        monthlySales += saleTotal;
        monthlyOrders++;
      }
    });

    const totalCustomers = uniqueCustomers.size;

    // 7-day daily trends for interactive chart
    const dailyTrends = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

      let dayRevenue = 0;
      let dayOrderCount = 0;

      sales.forEach(s => {
        if (s.status === 'VOIDED') return;
        const sDate = new Date(s.saleDate || s.createdAt);
        if (sDate >= dayStart && sDate < dayEnd) {
          dayRevenue += Number(s.total) || 0;
          dayOrderCount++;
        }
      });

      dailyTrends.push({
        date: dayStart.toISOString().split('T')[0],
        dayName: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        label: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Math.round(dayRevenue * 100) / 100,
        orders: dayOrderCount
      });
    }

    let totalStudents = 0;
    let batchRevenue = 0;
    const upcomingBatches = [];

    // Process all batches for students and revenue
    allBatches.forEach(batch => {
      if (batch.students && batch.students.length > 0) {
        totalStudents += batch.students.length;

        batch.students.forEach(s => {
          const paid = typeof s.paidAmount === 'number' 
            ? s.paidAmount 
            : (s.paymentStatus === 'Paid' ? (batch.seatPrice || 0) : 0);
          batchRevenue += paid;
        });
      }

      const batchDate = new Date(batch.date);
      const normalizedBatchDate = new Date(batchDate.getFullYear(), batchDate.getMonth(), batchDate.getDate()).getTime();
      const normalizedToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

      if (normalizedBatchDate >= normalizedToday) {
        upcomingBatches.push(batch);
      }
    });

    const topUpcomingBatches = upcomingBatches.slice(0, 5);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalStockQuantity,
        totalStockValue,
        outOfStockCount,
        lowStockCount,
        healthyStockCount,
        todaySales,
        todayOrders,
        monthlySales,
        monthlyOrders,
        allTimeSales,
        totalSalesCount,
        totalCustomers,
        totalClasses,
        totalStudents,
        batchRevenue,
        dailyTrends,
        upcomingBatches: topUpcomingBatches,
        lowStockProducts: lowStockProducts.slice(0, 6),
        recentMovements,
        recentSales
      }
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
