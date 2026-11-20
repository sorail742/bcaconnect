// Portage exact de backend/src/config/permissions.js — ne pas laisser
// diverger tant qu'Express et Nest cohabitent (même matrice RBAC des deux
// côtés). Toute modification doit être répercutée dans les deux fichiers
// jusqu'à ce que le module auth/user soit lui-même migré.
export const PERMISSIONS: Record<string, string[]> = {
  admin: [
    'manage_users',
    'manage_categories',
    'manage_all_orders',
    'view_all_transactions',
    'solve_disputes',
    'view_admin_dashboard',
    'manage_ads',
    'manage_education',
    'manage_content',
    'view_deletion_history',
    'view_audit_logs',
  ],
  fournisseur: [
    'manage_own_products',
    'view_own_orders',
    'update_order_item_status',
    'view_vendor_insights',
    'manage_own_store',
    'manage_ads',
  ],
  transporteur: [
    'view_available_deliveries',
    'assign_delivery',
    'update_delivery_status',
    'verify_delivery_otp',
  ],
  client: ['place_orders', 'view_own_profile', 'view_own_history', 'credit_wallet_request', 'report_dispute'],
  banque: ['view_financial_reports', 'view_all_transactions', 'manage_credits', 'view_admin_dashboard'],
  technicien: ['view_available_missions', 'accept_mission', 'complete_mission', 'view_own_equipments', 'view_own_profile'],
};

export function hasPermission(role: string | undefined | null, permission: string): boolean {
  if (!role) return false;
  const normalizedRole = String(role).toLowerCase();
  if (normalizedRole === 'admin') return true;
  return PERMISSIONS[normalizedRole]?.includes(permission) ?? false;
}
