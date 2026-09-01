const express = require('express');
const GlobalSettings = require('../models/GlobalSettings');

const router = express.Router();

router.get('/settings', async (req, res) => {
  try {
    const settings = await GlobalSettings.findOne();
    if (!settings) {
      return res.json({ success: true, data: { maintenanceMode: false, announcementText: '' } });
    }
    // Only return safe public settings
    res.json({
      success: true,
      data: {
        maintenanceMode: settings.maintenanceMode,
        announcementText: settings.announcementText,
        platformName: settings.platformName
      }
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
