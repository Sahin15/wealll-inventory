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
      Product.find({ tenantId }),
      Sale.find({ tenantId }),
      StockMovement.find({ tenantId }).sort({ createdAt: -1 }).limit(5).populate('productId', 'name sku'),
      Sale.find({ tenantId }).sort({ createdAt: -1 }).limit(5),
      ClassBatch.find({ tenantId }).sort({ date: 1 })
    ]);

    const totalClasses = allBatches.length;

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
    
    sales.forEach(s => {
      if (s.customerName) {
        uniqueCustomers.add(s.customerName.toLowerCase().trim());
      }

      const saleDate = new Date(s.saleDate);

      if (saleDate >= today) {
        todaySales += s.total;
      }
      if (saleDate >= thisMonth) {
        monthlySales += s.total;
      }
    });

    const totalCustomers = uniqueCustomers.size;

    let totalStudents = 0;
    let batchRevenue = 0;
    const upcomingBatches = [];

    // Process all batches for students and revenue
    allBatches.forEach(batch => {
      // students count
      if (batch.students && batch.students.length > 0) {
        totalStudents += batch.students.length;
        
        // calculate revenue from paid students
        const paidStudents = batch.students.filter(s => s.paymentStatus === 'Paid').length;
        batchRevenue += (paidStudents * batch.seatPrice);
      }
      
      // Collect upcoming batches
      const batchDate = new Date(batch.date);
      // normalize batch date to start of day for comparison
      const normalizedBatchDate = new Date(batchDate.getFullYear(), batchDate.getMonth(), batchDate.getDate()).getTime();
      const normalizedToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      if (normalizedBatchDate >= normalizedToday) {
        upcomingBatches.push(batch);
      }
    });

    // upcomingBatches is already sorted by date ASC because of the .sort({ date: 1 }) in the query
    const topUpcomingBatches = upcomingBatches.slice(0, 5);

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
        totalStudents,
        batchRevenue,
        upcomingBatches: topUpcomingBatches,
        lowStockProducts,
        recentMovements,
        recentSales
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
