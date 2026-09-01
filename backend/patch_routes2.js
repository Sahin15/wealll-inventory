const fs = require('fs');
const path = require('path');

const routeFiles = [
  'categoryRoutes.js',
  'productRoutes.js',
  'purchaseRoutes.js',
  'saleRoutes.js',
  'stockRoutes.js',
  'classRoutes.js',
  'dashboardRoutes.js',
  'analyticsRoutes.js'
];

const routesDir = path.join(__dirname, 'src', 'routes');

routeFiles.forEach(file => {
  const filePath = path.join(routesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('router.use(requireActiveSubscription);') && !content.includes("require('../middleware/subscriptionMiddleware')")) {
      content = content.replace(
        "require('../middleware/auth');",
        "require('../middleware/auth');\nconst { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');"
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Patched ${file}`);
    } else {
      console.log(`Skipped ${file}`);
    }
  }
});
