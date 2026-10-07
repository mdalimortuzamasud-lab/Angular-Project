import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Dashboard } from '../../../../model/dashboard.model';
import { BranchResponse } from '../../../../model/branch.model';
import { WarehouseResponse } from '../../../../model/warehouse.model';
import { UserResponseModel } from '../../../../model/user.model';
import { Inventory } from '../../../../model/inventory.model';
import { Sale } from '../../../../model/sale.model';

import { AuthService } from '../../../../services/auth.service';
import { DashboardService } from '../../../../services/dashboard.service';
import { BranchService } from '../../../../services/branch-service';
import { WarehouseService } from '../../../../services/warehouse-service';
import { UserService } from '../../../../services/user.service';
import { InventoryService } from '../../../../services/inventory.service';
import { SaleService } from '../../../../services/sale.service';

/** Client-side threshold: an inventory row at or below this is "low stock". */
const LOW_STOCK_THRESHOLD = 10;

/** How many rows to show in the recent-sales list. */
const RECENT_SALES_LIMIT = 5;

interface QuickAction {
  label: string;
  route: string;
  icon: string;
  btnClass?: string;
  roles?: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-component.html',
  styleUrl: 'dashboard-component.css'
})
export class DashboardComponent implements OnInit {
  latest: Dashboard | null = null;
  loading = true;
  error: string | null = null;

  // Branch info panel
  branch: BranchResponse | null = null;
  warehouses: WarehouseResponse[] = [];
  teamSize: number | null = null;
  branchInfoLoading = true;

  // Org-wide numbers, only meaningful for SUPER_ADMIN
  branchCount: number | null = null;

  // Low stock + recent sales
  lowStockItems: Inventory[] = [];
  recentSales: Sale[] = [];
  activityLoading = true;

  // Dynamic Quick Actions
  quickActions: QuickAction[] = [];

  readonly lowStockThreshold = LOW_STOCK_THRESHOLD;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private branchService: BranchService,
    private warehouseService: WarehouseService,
    private userService: UserService,
    private inventoryService: InventoryService,
    private saleService: SaleService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboardSnapshot();
    this.loadBranchInfo();
    this.setupQuickActions();
  }

  /**
   * Generates allowed quick actions matching app.routes.ts paths
   */
  private setupQuickActions(): void {
    const actions: QuickAction[] = [
      {
        label: 'Purchases',
        route: '/purchases',
        icon: 'bi-cart-check',
        btnClass: 'btn-outline-primary'
      },
      {
        label: 'Sales',
        route: '/sales',
        icon: 'bi-cash-coin',
        btnClass: 'btn-outline-primary'
      },
      {
        label: 'Inventory',
        route: '/inventory',
        icon: 'bi-boxes',
        btnClass: 'btn-outline-primary'
      },
      {
        label: 'Warehouses',
        route: '/warehouse',
        icon: 'bi-box-seam',
        btnClass: 'btn-outline-primary',
        roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER']
      },
      {
        label: 'Manage Users',
        route: '/users',
        icon: 'bi-people',
        btnClass: 'btn-outline-secondary',
        roles: ['SUPER_ADMIN', 'ADMIN']
      },
      {
        label: 'Manage Branches',
        route: '/branch',
        icon: 'bi-building',
        btnClass: 'btn-outline-secondary',
        roles: ['SUPER_ADMIN']
      }
    ];

    this.quickActions = actions.filter(action =>
      !action.roles || this.authService.hasRole(...action.roles)
    );
  }

  private loadDashboardSnapshot(): void {
    this.dashboardService.getAll().subscribe({
      next: (all) => {
        const user = this.authService.currentUser;

        const scoped = this.authService.isSuperAdmin()
          ? all
          : all.filter(d => d.branchId === user?.branchId);

        this.latest = scoped.length
          ? scoped.reduce((a, b) =>
            new Date(a.lastCalculatedAt) > new Date(b.lastCalculatedAt) ? a : b)
          : null;

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private loadBranchInfo(): void {
    const user = this.authService.currentUser;

    if (this.authService.isSuperAdmin() || !user?.branchId) {
      this.branchService.getAll()
        .pipe(catchError(() => of([])))
        .subscribe(branches => {
          this.branchCount = branches.length;
          this.branchInfoLoading = false;
          this.cdr.markForCheck();
        });

      this.loadActivity(null);
      return;
    }

    const branchId = user.branchId;
    const canSeeTeam = this.authService.hasRole('SUPER_ADMIN', 'ADMIN');

    forkJoin({
      branch: this.branchService.getById(branchId).pipe(catchError(() => of(null))),
      warehouses: this.warehouseService.getByBranch(branchId).pipe(catchError(() => of([] as WarehouseResponse[]))),
      users: canSeeTeam
        ? this.userService.getAllUsers().pipe(catchError(() => of([] as UserResponseModel[])))
        : of(null),
    }).subscribe(({ branch, warehouses, users }) => {
      this.branch = branch;
      this.warehouses = warehouses;
      this.teamSize = users ? users.filter(u => u.branchId === branchId).length : null;
      this.branchInfoLoading = false;
      this.cdr.markForCheck();

      this.loadActivity(warehouses.map(w => w.id));
    });
  }

  private loadActivity(warehouseIds: number[] | null): void {
    const scopeToBranch = !!warehouseIds && warehouseIds.length > 0;

    const inventory$ = scopeToBranch
      ? forkJoin((warehouseIds as number[]).map(id =>
          this.inventoryService.getByWarehouseId(id).pipe(catchError(() => of([] as Inventory[])))
        )).pipe(map(lists => lists.flat()))
      : this.inventoryService.getAll().pipe(catchError(() => of([] as Inventory[])));

    const sales$ = this.saleService.getAll().pipe(catchError(() => of([] as Sale[])));

    forkJoin({ inventory: inventory$, sales: sales$ }).subscribe(({ inventory, sales }) => {
      this.lowStockItems = inventory
        .filter(i => i.availableQuantity <= this.lowStockThreshold)
        .sort((a, b) => a.availableQuantity - b.availableQuantity)
        .slice(0, 8);

      const scopedSales = scopeToBranch
        ? sales.filter(s => (warehouseIds as number[]).includes(s.warehouseId))
        : sales;

      this.recentSales = scopedSales
        .sort((a, b) => b.id - a.id)
        .slice(0, RECENT_SALES_LIMIT);

      this.activityLoading = false;
      this.cdr.markForCheck();
    });
  }
}