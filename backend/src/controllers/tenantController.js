const Tenant = require('../models/Tenant');

// @desc    Get tenant settings
// @route   GET /api/tenants/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: tenant._id,
        name: tenant.name,
        businessName: tenant.businessName,
        ownerName: tenant.ownerName,
        email: tenant.email,
        phone: tenant.phone,
        businessPhone: tenant.businessPhone,
        businessAddress: tenant.businessAddress,
        taxRate: tenant.taxRate,
        invoiceHeaderText: tenant.invoiceHeaderText,
        invoiceFooterText: tenant.invoiceFooterText,
        appName: tenant.appName,
        logoUrl: tenant.logoUrl,
        status: tenant.status
      }
    });
  } catch (error) {
    console.error('Error fetching tenant settings:', error);
    res.status(500).json({ success: false, error: 'Server error fetching tenant settings' });
  }
};

// @desc    Update tenant settings
// @route   PUT /api/tenants/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const { businessName, ownerName, email, phone, businessPhone, businessAddress, taxRate, invoiceHeaderText, invoiceFooterText, appName, logoUrl } = req.body;

    // Only update allowed fields. Ensure we use req.user.tenantId
    const tenant = await Tenant.findByIdAndUpdate(
      req.user.tenantId,
      {
        businessName,
        ownerName,
        email,
        phone,
        businessPhone,
        businessAddress,
        taxRate: taxRate !== undefined ? Number(taxRate) : undefined,
        invoiceHeaderText,
        invoiceFooterText,
        appName,
        logoUrl
      },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: tenant._id,
        name: tenant.name,
        businessName: tenant.businessName,
        ownerName: tenant.ownerName,
        email: tenant.email,
        phone: tenant.phone,
        businessPhone: tenant.businessPhone,
        businessAddress: tenant.businessAddress,
        taxRate: tenant.taxRate,
        invoiceHeaderText: tenant.invoiceHeaderText,
        invoiceFooterText: tenant.invoiceFooterText,
        appName: tenant.appName,
        logoUrl: tenant.logoUrl,
        status: tenant.status
      }
    });
  } catch (error) {
    console.error('Error updating tenant settings:', error);
    res.status(500).json({ success: false, error: 'Server error updating tenant settings' });
  }
};
