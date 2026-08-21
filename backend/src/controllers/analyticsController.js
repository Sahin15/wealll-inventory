const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private (Superadmin, Admin, Manager)
exports.getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const tenantId = req.user.tenantId;
  
  // Default to last 30 days if no dates provided
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));

  const matchStage = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: 'COMPLETED',
    saleDate: { $gte: start, $lte: end }
  };

  // 1. Get Key Metrics (Total Revenue, Total Sales Count)
  const metrics = await Sale.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$total" },
        totalSales: { $sum: 1 }
      }
    }
  ]);

  // 2. Sales Trend (Revenue by day)
  const salesTrend = await Sale.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // 3. Top Products by Quantity Sold
  const topProducts = await Sale.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        quantitySold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.total" }
      }
    },
    { $sort: { quantitySold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: "$product" },
    {
      $project: {
        _id: 1,
        name: "$product.name",
        sku: "$product.sku",
        quantitySold: 1,
        revenue: 1
      }
    }
  ]);
  
  // 4. Calculate Profit Margin 
  // (Total Revenue - (Quantity * Current Purchase Price))
  const profitData = await Sale.aggregate([
    { $match: matchStage },
    { $unwind: "$items" },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$items.total" },
        totalCost: { 
          $sum: { $multiply: ["$items.quantity", "$productInfo.purchasePrice"] } 
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

  res.status(200).json({
    success: true,
    data: {
      metrics: metrics[0] || { totalRevenue: 0, totalSales: 0 },
      profit: profitData[0] || { totalRevenue: 0, totalCost: 0, totalProfit: 0 },
      salesTrend: salesTrend.map(item => ({ date: item._id, revenue: item.revenue, orders: item.orders })),
      topProducts
    }
  });
});
