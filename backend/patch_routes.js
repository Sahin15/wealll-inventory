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
    
    // Check if requireActiveSubscription is already imported
    if (!content.includes('requireActiveSubscription')) {
      content = content.replace(
        "const { protect } = require('../middleware/auth');",
        "const { protect } = require('../middleware/auth');\nconst { requireActiveSubscription } = require('../middleware/subscriptionMiddleware');"
      );
      
      content = content.replace(
        "router.use(protect);",
        "router.use(protect);\nrouter.use(requireActiveSubscription);"
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Patched ${file}`);
    } else {
      console.log(`Skipped ${file} (already patched)`);
    }
  }
});

// Now patch server.js to remove requireActiveSubscription
const serverPath = path.join(__dirname, 'src', 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');
serverContent = serverContent.replace(
  "const { requireActiveSubscription } = require('./middleware/subscriptionMiddleware');\n", 
  ""
);
serverContent = serverContent.replace(/requireActiveSubscription, /g, '');
fs.writeFileSync(serverPath, serverContent);
console.log('Patched server.js');
