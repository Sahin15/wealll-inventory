const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ tenantId: req.user.tenantId }).populate('categoryId', 'name');
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, sku, brand, categoryId, unit, purchasePrice, sellingPrice, minimumStock } = req.body;
    
    const product = await Product.create({
      tenantId: req.user.tenantId,
      name, sku, brand, categoryId, unit, purchasePrice, sellingPrice, minimumStock
    });
    
    await product.populate('categoryId', 'name');
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Product SKU already exists' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.tenantId; // Prevent tenant ID update
    delete updates.currentStock; // Prevent direct stock manipulation

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId },
      updates,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Product SKU already exists' });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
