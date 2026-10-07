import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../../../services/inventory.service';
import { Inventory } from '../../../../model/inventory.model';
import { WarehouseService } from '../../../../services/warehouse-service';
import { ProductService } from '../../../../services/product.service';
import { WarehouseResponse } from '../../../../model/warehouse.model';
import { ProductResponseModel } from '../../../../model/product.model';


interface DropdownOption {
  id: number;
  name: string;
}


@Component({
  selector: 'app-inventory-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.css',
})
export class InventoryList {

  inventories: Inventory[] = [];
  loading = false;
  errorMessage = '';

  warehouses: WarehouseResponse[] = [];
  products: ProductResponseModel[] = [];


  selectedWarehouseId: number | null = null;
  selectedProductId: number | null = null;

  // Client-side search across product/warehouse name, applied on top of
  // whatever the current warehouse/product filter already returned.
  searchTerm = '';

  // Highlights rows at/near zero so low stock is easy to spot at a glance.
  lowStockThreshold = 10;

  constructor(private inventoryService: InventoryService, private cdr: ChangeDetectorRef, private warehouseService: WarehouseService, private productService: ProductService) { }

  ngOnInit(): void {
    this.loadAll();
    this.loadWarehouses();
    this.loadProducts();
  }

  loadAll(): void {
    this.loading = true;
    this.errorMessage = '';
    this.inventoryService.getAll().subscribe({
      next: (data) => {
        this.inventories = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load inventory.';
        this.loading = false;
      }
    });
  }

  loadWarehouses() {
    this.warehouseService.getAll().subscribe({
      next: (res) => {
        this.warehouses = res,
          this.cdr.markForCheck();
      }
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


  onWarehouseFilterChange(): void {
    this.selectedProductId = null; // keep filters mutually exclusive for simplicity
    if (!this.selectedWarehouseId) {
      this.loadAll();
      return;
    }
    this.loading = true;
    this.inventoryService.getByWarehouseId(this.selectedWarehouseId).subscribe({
      next: (data) => {
        this.inventories = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to filter inventory by warehouse.';
        this.loading = false;
      }
    });
  }

  onProductFilterChange(): void {
    this.selectedWarehouseId = null;
    if (!this.selectedProductId) {
      this.loadAll();
      return;
    }
    this.loading = true;
    this.inventoryService.getByProductId(this.selectedProductId).subscribe({
      next: (data) => {
        this.inventories = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to filter inventory by product.';
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.selectedWarehouseId = null;
    this.selectedProductId = null;
    this.searchTerm = '';
    this.loadAll();
  }

  get filteredInventories(): Inventory[] {
    if (!this.searchTerm.trim()) {
      return this.inventories;
    }
    const term = this.searchTerm.trim().toLowerCase();
    return this.inventories.filter(
      (inv) =>
        inv.productName?.toLowerCase().includes(term) ||
        inv.warehouseName?.toLowerCase().includes(term)
    );
  }

  isLowStock(inv: Inventory): boolean {
    return inv.availableQuantity <= this.lowStockThreshold;
  }

  isOutOfStock(inv: Inventory): boolean {
    return inv.availableQuantity <= 0;
  }

}
