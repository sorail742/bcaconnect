
const { hasPermission } = require('./src/config/permissions');

console.log('--- TESTING PERMISSIONS ---');
console.log('admin, manage_categories:', hasPermission('admin', 'manage_categories'));
console.log('Admin, manage_categories:', hasPermission('Admin', 'manage_categories'));
console.log('client, manage_categories:', hasPermission('client', 'manage_categories'));
console.log('null, manage_categories:', hasPermission(null, 'manage_categories'));
console.log('---------------------------');
