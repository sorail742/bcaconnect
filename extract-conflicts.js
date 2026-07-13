const fs = require('fs');
const files = [
  'backend/src/controllers/deliveryController.js',
  'backend/src/index.js',
  'frontend/.env.example',
  'frontend/src/components/landing/BcaCategoryMegaPanel.jsx',
  'frontend/src/components/landing/BcaMegaMenu.jsx',
  'frontend/src/components/layout/DashboardLayout.jsx',
  'frontend/src/components/layout/MainLayout.jsx',
  'frontend/src/components/layout/Navbar.jsx',
  'frontend/src/constants/api.js',
  'frontend/src/pages/auth/Login.jsx',
  'frontend/src/pages/carrier/CarrierDashboard.jsx',
  'frontend/src/pages/vendor/AddProduct.jsx'
];

let report = '';
for (const file of files) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    let inConflict = false;
    let conflictBlock = [];
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('<<<<<<<')) {
        inConflict = true;
        report += `\n--- Conflict in ${file} ---\n`;
      }
      
      if (inConflict) {
        conflictBlock.push(lines[i]);
      }
      
      if (lines[i].startsWith('>>>>>>>')) {
        inConflict = false;
        report += conflictBlock.join('\n') + '\n';
        conflictBlock = [];
      }
    }
  }
}
fs.writeFileSync('conflicts.txt', report);
console.log('Saved to conflicts.txt');
