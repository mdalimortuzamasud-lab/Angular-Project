import { ChangeDetectorRef, Component } from '@angular/core';
import { InventoryTransaction, InventoryTransactionType } from '../../../../model/inventory-transaction.model';
import { InventoryTransactionService } from '../../../../services/inventory-transaction.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-transaction-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-transaction-list.html',
  styleUrl: './inventory-transaction-list.css',
})
export class InventoryTransactionList {



  transactions: InventoryTransaction[] = [];
  loading = false;
  errorMessage = '';

  types = Object.values(InventoryTransactionType);
  selectedType: InventoryTransactionType | '' = '';

  // Populated automatically if navigated here from the Inventory list
  // "History" link (?productId=..&warehouseId=..)
  filterProductId: number | null = null;
  filterWarehouseId: number | null = null;

  constructor(
    private inventoryTransactionService: InventoryTransactionService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const productId = params.get('productId');
      const warehouseId = params.get('warehouseId');

      if (productId && warehouseId) {
        this.filterProductId = Number(productId);
        this.filterWarehouseId = Number(warehouseId);
        this.loadByProductAndWarehouse(this.filterProductId, this.filterWarehouseId);
      } else {
        this.loadAll();
      }
    });
  }

  loadAll(): void {
    this.loading = true;
    this.inventoryTransactionService.getAll().subscribe({
      next: (data) => {
        this.setSorted(data);
        this.cdr.markForCheck();
      },
      error: () => this.onError('Failed to load transactions.')
    });
  }

  loadByProductAndWarehouse(productId: number, warehouseId: number): void {
    this.loading = true;
    this.inventoryTransactionService.getByProductIdAndWarehouseId(productId, warehouseId).subscribe({
      next: (data) => {
        this.setSorted(data);
        this.cdr.markForCheck();
      },
      error: () => this.onError('Failed to load transaction history.')
    });
  }

  onTypeFilterChange(): void {
    this.filterProductId = null;
    this.filterWarehouseId = null;

    if (!this.selectedType) {
      this.loadAll();
      return;
    }
    this.loading = true;
    this.inventoryTransactionService.getByType(this.selectedType).subscribe({
      next: (data) => {
        this.setSorted(data);
        this.cdr.markForCheck();
      },
      error: () => this.onError('Failed to filter transactions.')
    });
  }

  clearFilters(): void {
    this.selectedType = '';
    this.filterProductId = null;
    this.filterWarehouseId = null;
    this.loadAll();
  }

  typeBadgeClass(type: InventoryTransactionType): string {
    switch (type) {
      case InventoryTransactionType.IN: return 'badge bg-success';
      case InventoryTransactionType.OUT: return 'badge bg-danger';
      case InventoryTransactionType.ADJUST: return 'badge bg-info text-dark';
      case InventoryTransactionType.TRANSFER: return 'badge bg-primary';
      default: return 'badge bg-secondary';
    }
  }

  private setSorted(data: InventoryTransaction[]): void {
    // Most recent first
    this.transactions = [...data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    this.loading = false;
  }

  private onError(message: string): void {
    this.errorMessage = message;
    this.loading = false;
  }
}
