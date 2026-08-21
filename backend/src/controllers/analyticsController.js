const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');

exports.getTrends = async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    // Group sales by date (last 30 days or so, for simplicity we group all)
    const trends = await Sale.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalRevenue: { $sum: '$total' },
          totalSales: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trends', error: error.message });
  }
};

exports.getTopProducts = async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    // Unwind products in sales and group by productId
    const topProducts = await Sale.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          totalSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          name: '$productDetails.name',
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top products', error: error.message });
  }
};

exports.getProfitMargins = async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    // Calculate profit: revenue - cost of goods sold (COGS)
    const profitData = await Sale.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId) } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
          totalCost: { $sum: { $multiply: ['$products.quantity', '$productDetails.purchasePrice'] } }
        }
      }
    ]);

    if (profitData.length > 0) {
      const { totalRevenue, totalCost } = profitData[0];
      const profit = totalRevenue - totalCost;
      const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      res.json({ totalRevenue, totalCost, profit, margin });
    } else {
      res.json({ totalRevenue: 0, totalCost: 0, profit: 0, margin: 0 });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profit margins', error: error.message });
  }
};
