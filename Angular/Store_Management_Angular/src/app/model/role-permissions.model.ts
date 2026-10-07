// Single source of truth for role-based feature access.
// Both app.routes.ts (route guarding) and sidebar.ts (menu visibility)
// read from this file, so a role's access only ever needs to change here.
//
// Roles come from backend RoleName enum: SUPER_ADMIN | ADMIN | MANAGER | STAFF | CASHIER.
// SUPER_ADMIN and ADMIN are treated as full-access below (kept explicit per
// feature anyway, so it's easy to peel ADMIN back later without touching routes).

export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'CASHIER';

export type FeatureKey =
  | 'dashboard'
  | 'branch'
  | 'warehouse'
  | 'category'
  | 'products'
  | 'suppliers'
  | 'supplier-payments'
  | 'customers'
  | 'customer-payments'
  | 'inventory'
  | 'inventory-transactions'
  | 'purchases'
  | 'purchase-returns'
  | 'sales'
  | 'sale-returns'
  | 'stock-transfers'
  | 'users'
  | 'roles';

const ALL_ROLES: AppRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'CASHIER'];
const ADMIN_ONLY: AppRole[] = ['SUPER_ADMIN', 'ADMIN'];
const MANAGER_UP: AppRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'];

export const FEATURE_ROLES: Record<FeatureKey, AppRole[]> = {
  dashboard: ALL_ROLES,

  branch: ADMIN_ONLY,
  warehouse: ADMIN_ONLY,

  category: MANAGER_UP,
  products: ALL_ROLES,               // STAFF/CASHIER can view products while selling
  suppliers: MANAGER_UP,
  'supplier-payments': MANAGER_UP,
  customers: ALL_ROLES,               // needed at point-of-sale too
  'customer-payments': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER'],

  inventory: MANAGER_UP,
  'inventory-transactions': MANAGER_UP,

  purchases: MANAGER_UP,
  'purchase-returns': MANAGER_UP,

  sales: ALL_ROLES,
  'sale-returns': ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STAFF', 'CASHIER'],

  'stock-transfers': MANAGER_UP,

  users: ADMIN_ONLY,
  roles: ADMIN_ONLY,
};

export function rolesFor(feature: FeatureKey): AppRole[] {
  return FEATURE_ROLES[feature];
}
