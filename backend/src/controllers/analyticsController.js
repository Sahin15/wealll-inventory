const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const ClassBatch = require('../models/ClassBatch');
const Category = require('../models/Category');

// @desc    Get comprehensive analytics & reporting
// @route   GET /api/analytics
// @access  Private (Superadmin, Admin, Manager)
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, range } = req.query;
    const tenantId = req.user.tenantId;
    
    if (!tenantId || (typeof tenantId !== 'string' && !mongoose.Types.ObjectId.isValid(tenantId))) {
      return res.status(401).json({ success: false, error: 'Invalid or missing tenant ID in session' });
    }

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

    // Calculate start and end date based on range or query parameters
    const now = new Date();
    let start = null;
    let end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (range === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (range === '7days') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30days') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'thisMonth') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    } else if (range === '90days') {
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (range === 'year') {
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (range === 'all' || startDate === 'all') {
      start = null;
      end = null;
    } else if (startDate) {
      start = new Date(startDate);
    } else {
      // Default: Last 30 days
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const saleMatchStage = {
      tenantId: tenantObjectId,
      status: { $ne: 'VOIDED' }
    };

    if (start && end) {
      saleMatchStage.saleDate = { $gte: start, $lte: end };
    } else if (start) {
      saleMatchStage.saleDate = { $gte: start };
    }

    // 1. Sales Key Metrics
    const salesMetricsAgg = await Sale.aggregate([
      { $match: saleMatchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalSales: { $sum: 1 },
          totalPaid: { $sum: { $ifNull: ["$paidAmount", "$total"] } },
          totalDue: { $sum: { $ifNull: ["$dueAmount", 0] } }
        }
      }
    ]);

    const salesMetrics = salesMetricsAgg[0] || {
      totalRevenue: 0,
      totalSales: 0,
      totalPaid: 0,
      totalDue: 0
    };

    // 2. Sales Trend by Day
    const salesTrend = await Sale.aggregate([
      { $match: saleMatchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
          revenue: { $sum: "$total" },
          paid: { $sum: { $ifNull: ["$paidAmount", "$total"] } },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
          paid: 1,
          orders: 1
        }
      }
    ]);

    // 3. Top Products by Quantity & Revenue Sold
    const topProducts = await Sale.aggregate([
      { $match: saleMatchStage },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          quantitySold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ["$product.name", "Unknown Product"] },
          sku: { $ifNull: ["$product.sku", ""] },
          unit: { $ifNull: ["$product.unit", "pcs"] },
          currentStock: { $ifNull: ["$product.currentStock", 0] },
          quantitySold: 1,
          revenue: 1
        }
      }
    ]);

    // 4. Category Breakdown
    const categoryAgg = await Sale.aggregate([
      { $match: saleMatchStage },
      { $unwind: "$items" },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$product.categoryId",
          revenue: { $sum: "$items.total" },
          unitsSold: { $sum: "$items.quantity" }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ["$category.name", "Uncategorized"] },
          color: { $ifNull: ["$category.color", "#6366f1"] },
          revenue: 1,
          unitsSold: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // 5. Profit Margin Calculation (Sales Revenue - Total Cost of Goods Sold)
    const profitData = await Sale.aggregate([
      { $match: saleMatchStage },
      { $unwind: "$items" },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$items.total" },
          totalCost: { 
            $sum: { 
              $multiply: [
                "$items.quantity", 
                { $ifNull: ["$productInfo.purchasePrice", { $ifNull: ["$productInfo.costPrice", 0] }] }
              ] 
            } 
          }
        }
      },
      {
        $project: {
          totalRevenue: 1,
          totalCost: 1,
          totalProfit: { $subtract: ["$totalRevenue", "$totalCost"] }
        }
      }
    ]);

    const profit = profitData[0] || { totalRevenue: 0, totalCost: 0, totalProfit: 0 };
    const profitMargin = profit.totalRevenue > 0 
      ? Math.round((profit.totalProfit / profit.totalRevenue) * 100) 
      : 0;

    // 6. Academy Class Batches Analytics
    const batchQuery = { tenantId: tenantObjectId };
    if (start && end) {
      batchQuery.date = { $gte: start, $lte: end };
    } else if (start) {
      batchQuery.date = { $gte: start };
    }

    const allBatches = await ClassBatch.find(batchQuery).sort({ date: -1 }).lean();

    let totalBatches = allBatches.length;
    let totalStudents = 0;
    let batchExpectedRevenue = 0;
    let batchCollectedRevenue = 0;
    let batchDueRevenue = 0;

    const batchPerformance = allBatches.map(b => {
      const seatFee = b.seatPrice || 0;
      const count = b.students ? b.students.length : 0;
      const expected = count * seatFee;
      let collected = 0;
      let attendedCount = 0;

      (b.students || []).forEach(s => {
        if (s.attended) attendedCount++;
        const sPaid = typeof s.paidAmount === 'number' ? s.paidAmount : (s.paymentStatus === 'Paid' ? seatFee : 0);
        collected += sPaid;
      });

      const due = Math.max(0, expected - collected);
      const collectionRate = expected > 0 ? Math.round((collected / expected) * 100) : 0;

      totalStudents += count;
      batchExpectedRevenue += expected;
      batchCollectedRevenue += collected;
      batchDueRevenue += due;

      return {
        _id: b._id,
        batchNumber: b.batchNumber,
        topic: b.topic,
        date: b.date,
        seatPrice: seatFee,
        studentCount: count,
        attendedCount,
        expectedRevenue: expected,
        collectedRevenue: collected,
        dueRevenue: due,
        collectionRate
      };
    });

    // Sort batch performance by collected revenue descending
    batchPerformance.sort((a, b) => b.collectedRevenue - a.collectedRevenue);

    // 7. Recent Transactions (Top 5)
    const recentTransactions = await Sale.find(saleMatchStage)
      .sort({ saleDate: -1 })
      .limit(5)
      .populate('items.productId', 'name unit')
      .lean();

    // 8. Combined Totals
    const totalCombinedRevenue = salesMetrics.totalRevenue + batchCollectedRevenue;
    const totalOutstandingDues = salesMetrics.totalDue + batchDueRevenue;
    const avgOrderValue = salesMetrics.totalSales > 0 
      ? Math.round(salesMetrics.totalRevenue / salesMetrics.totalSales) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        dateRange: {
          start: start ? start.toISOString() : null,
          end: end ? end.toISOString() : null,
          range: range || '30days'
        },
        metrics: {
          combinedRevenue: totalCombinedRevenue,
          productRevenue: salesMetrics.totalRevenue,
          batchRevenue: batchCollectedRevenue,
          totalSales: salesMetrics.totalSales,
          totalStudents,
          totalBatches,
          totalDue: totalOutstandingDues,
          productDues: salesMetrics.totalDue,
          batchDues: batchDueRevenue,
          avgOrderValue
        },
        profit: {
          totalRevenue: profit.totalRevenue,
          totalCost: profit.totalCost,
          totalProfit: profit.totalProfit,
          profitMargin
        },
        salesTrend,
        topProducts,
        categoryBreakdown: categoryAgg,
        batchPerformance: batchPerformance.slice(0, 5),
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};
