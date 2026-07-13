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

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    if (file === 'backend/src/controllers/deliveryController.js') {
        // Keep both
        content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> cc9e8c22a12230e3e9d0244ad41cdcde74833070\n/g, "$1$2");
    } else if (file === 'backend/src/index.js') {
        // First conflict: Keep Theirs but add any missing from HEAD? 
        // HEAD: const { sequelize } = require("./models");
        // Theirs: const app = require("./app"); \n const { sequelize, Category } = require("./models");
        // Second conflict:
        // HEAD: const { initCategoryAttributes } = require("./constants/categoryAttributes");
        // Theirs: const { ensureDefaultCategories } = require("./config/defaultCategories");
        // Third conflict:
        // HEAD: (empty)
        // Theirs: if (process.env.NODE_ENV !== 'production') ...
        
        let i = 0;
        content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> cc9e8c22a12230e3e9d0244ad41cdcde74833070\n?/g, (match, p1, p2) => {
            i++;
            if (i === 1) return p2; // Keep theirs for first
            if (i === 2) return p1 + p2; // Keep both for second
            if (i === 3) return p2; // Keep theirs for third
            return p2;
        });
    } else {
        // Keep Theirs for all other files
        content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> cc9e8c22a12230e3e9d0244ad41cdcde74833070\n?/g, "$2");
    }
    
    fs.writeFileSync(file, content);
    console.log('Resolved', file);
  }
}
