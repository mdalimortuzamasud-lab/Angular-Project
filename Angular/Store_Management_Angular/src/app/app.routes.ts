import { Routes } from '@angular/router';
import { CategoryComponent } from './components/feature/product/category-component/category-component';
import { CustomerComponent } from './components/feature/product/customer-component/customer-component';
import { SupplierComponent } from './components/feature/product/supplier-component/supplier-component';
import { ProductComponent } from './components/feature/product/product-component/product-component';

import { BranchComponent } from './components/feature/store/branch-component/branch-component';
import { WarehouseComponent } from './components/feature/store/warehouse-component/warehouse-component';
import { PurchaseListComponent } from './components/purchase/purchase-list-component/purchase-list-component';
import { PurchaseFormComponent } from './components/purchase/purchase-form-component/purchase-form-component';
import { PurchaseDetailComponent } from './components/purchase/purchase-detail-component/purchase-detail-component';
import { InventoryList } from './component/features/inventory/inventory-list/inventory-list';
import { InventoryTransactionList } from './component/features/inventory/inventory-transaction-list/inventory-transaction-list';
import { SaleList } from './components/feature/sales/sale-list/sale-list';
import { SaleForm } from './components/feature/sales/sale-form/sale-form';
import { SaleDetail } from './components/feature/sales/sale-detail/sale-detail';
import { PurchaseReturnComponent } from './components/purchase-return/purchase-return-component/purchase-return-component';
import { SaleReturnComponent } from './components/feature/sale-return/sale-return-component/sale-return-component';
import { SupplierPaymentComponent } from './components/feature/product/supplier-payment-component/supplier-payment-component';
import { CustomerPaymentComponent } from './components/feature/product/customer-payment-component/customer-payment-component';
import { StockTransferComponent } from './components/feature/stock/stock-transfer-component/stock-transfer-component';
import { UserComponent } from './components/feature/user/user-component/user-component';
import { RoleComponent } from './components/feature/role/role-component/role-component';
import { LoginComponent } from './components/feature/auth/auth-component/auth-component';
import { DashboardComponent } from './components/feature/dashboar/dashboard-component/dashboard-component';
import { authGuard } from './components/feature/auth/auth.guard';
import { roleGuard } from './components/feature/auth/role.guard';
import { UnauthorizedComponent } from './components/shared/unauthorized/unauthorized';
import { FEATURE_ROLES } from './model/role-permissions.model';

// Everything below is behind authGuard (must be logged in) AND roleGuard
// (must have one of the roles listed for that feature in role-permissions.ts).
// Branch-level data scoping for ADMIN/MANAGER/STAFF/CASHIER happens
// server-side (see UserServiceImpl / branchId filtering) - these guards only
// control which SCREENS a role can open, not which rows within a screen.
export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },

  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.dashboard } },

  { path: 'category', component: CategoryComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.category } },
  { path: 'branch', component: BranchComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.branch } },
  { path: 'warehouse', component: WarehouseComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.warehouse } },
  { path: 'customers', component: CustomerComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.customers } },
  { path: 'suppliers', component: SupplierComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.suppliers } },
  { path: 'products', component: ProductComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.products } },

  { path: 'purchases', component: PurchaseListComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.purchases } },
  { path: 'purchases/new', component: PurchaseFormComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.purchases } },
  { path: 'purchases/:id', component: PurchaseDetailComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.purchases } },
  { path: 'purchases/:id/edit', component: PurchaseFormComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.purchases } },

  { path: 'inventory', component: InventoryList, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.inventory } },
  { path: 'inventory-transactions', component: InventoryTransactionList, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES['inventory-transactions'] } },

  { path: 'sales', component: SaleList, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.sales } },
  { path: 'sales/new', component: SaleForm, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.sales } },
  { path: 'sales/:id', component: SaleDetail, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.sales } },
  { path: 'sales/:id/edit', component: SaleForm, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.sales } },

  { path: 'purchase-returns', component: PurchaseReturnComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES['purchase-returns'] } },
  { path: 'sale-returns', component: SaleReturnComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES['sale-returns'] } },
  { path: 'sale-returns/:saleId', component: SaleReturnComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES['sale-returns'] } },

  { path: 'supplier-payments', component: SupplierPaymentComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES['supplier-payments'] } },
  { path: 'customer-payments', component: CustomerPaymentComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES['customer-payments'] } },

  { path: 'stock-transfers', component: StockTransferComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES['stock-transfers'] } },

  { path: 'users', component: UserComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.users } },
  { path: 'roles', component: RoleComponent, canActivate: [authGuard, roleGuard], data: { roles: FEATURE_ROLES.roles } },

  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
