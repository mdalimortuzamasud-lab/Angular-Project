import { ChangeDetectorRef, Component } from '@angular/core';
import { Sale, SaleStatus } from '../../../../model/sale.model';
import { SaleItem, SaleItemDraft, SaleItemRequest } from '../../../../model/sale-item.model';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SaleService } from '../../../../services/sale.service';
import { SaleItemService } from '../../../../services/sale-item.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../services/product.service';


interface ProductOption {
  id: number;
  name: string;
  sellingPrice: number;
}



@Component({
  selector: 'app-sale-detail',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sale-detail.html',
  styleUrl: './sale-detail.css',
})
export class SaleDetail {
  
 saleId!: number;
  sale: Sale | null = null;
  items: SaleItem[] = [];

  products: ProductOption[] = []; // TODO: load from ProductService.getAll()

  loading = false;
  errorMessage = '';
  successMessage = '';

  draftItems: SaleItemDraft[] = [];

  editingItemId: number | null = null;
  editQuantity: number | null = null;
  editSellingPrice: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private saleService: SaleService,
    private saleItemService: SaleItemService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,

  ) {}

  ngOnInit(): void {
    this.saleId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSale();
    this.loadItems();
    this.addDraftRow();
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.cdr.markForCheck();
      },
      error: () => (this.errorMessage = 'Failed to load sale.')
    });
  }
  loadSale(): void {
    this.saleService.getById(this.saleId).subscribe({
      next: (data) => {
        (this.sale = data);
        this.cdr.markForCheck();
      },
      error: () => (this.errorMessage = 'Failed to load sale.')
    });
  }

  loadItems(): void {
    this.loading = true;
    this.saleItemService.getBySaleId(this.saleId).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load sale items.';
        this.loading = false;
      }
    });
  }

  // ---------- Batch add rows ----------

  addDraftRow(): void {
    this.draftItems.push({ productId: null, quantity: null, sellingPrice: null });
    this.cdr.markForCheck();
  }

  removeDraftRow(index: number): void {
    this.draftItems.splice(index, 1);
  }

  onDraftProductChange(row: SaleItemDraft): void {
    const product = this.products.find((p) => p.id === row.productId);
    if (product && !row.sellingPrice) {
      row.sellingPrice = product.sellingPrice;
    }
  }

  get canSubmitDraft(): boolean {
    return this.draftItems.some(
      (r) => r.productId && r.quantity && r.quantity > 0 && r.sellingPrice !== null && r.sellingPrice >= 0
    );
  }

  submitDraftItems(): void {
    const validRows = this.draftItems.filter(
      (r) => r.productId && r.quantity && r.quantity > 0 && r.sellingPrice !== null && r.sellingPrice! >= 0
    );

    if (validRows.length === 0) {
      return;
    }

    const requests: SaleItemRequest[] = validRows.map((r) => ({
      saleId: this.saleId,
      productId: r.productId!,
      quantity: r.quantity!,
      sellingPrice: r.sellingPrice!
    }));

    this.errorMessage = '';
    this.successMessage = '';

    this.saleItemService.createBatch(this.saleId, requests).subscribe({
      next: () => {
        this.successMessage = `${requests.length} item(s) sold.`;
        this.draftItems = [];
        this.addDraftRow();
        this.loadItems();
        this.loadSale();
      },
      error: (err) => {
        // GlobalExceptionHandler returns { message: "Insufficient stock for
        // product id X in warehouse id Y. Available: A, requested: B" }
        // on a 400 when any row in the batch oversells — the whole batch
        // is rolled back, so nothing gets partially saved.
        this.errorMessage = err?.error?.message
          || 'Failed to add items. Please check stock availability.';
      }
    });
  }

  // ---------- Inline edit existing item ----------

  startEdit(item: SaleItem): void {
    this.editingItemId = item.id;
    this.editQuantity = item.quantity;
    this.editSellingPrice = item.sellingPrice;
  }

  cancelEdit(): void {
    this.editingItemId = null;
  }

  saveEdit(item: SaleItem): void {
    if (!this.editQuantity || this.editQuantity <= 0 || this.editSellingPrice === null || this.editSellingPrice < 0) {
      return;
    }

    const request: SaleItemRequest = {
      saleId: this.saleId,
      productId: item.productId,
      quantity: this.editQuantity,
      sellingPrice: this.editSellingPrice
    };

    this.errorMessage = '';
    this.saleItemService.update(item.id, request).subscribe({
      next: () => {
        this.editingItemId = null;
        this.loadItems();
        this.loadSale();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to update item.';
      }
    });
  }

  deleteItem(item: SaleItem): void {
    if (!confirm(`Remove ${item.productName} from this sale?`)) {
      return;
    }
    this.saleItemService.delete(item.id).subscribe({
      next: () => {
        this.loadItems();
        this.loadSale();
      },
      error: () => (this.errorMessage = 'Failed to delete item.')
    });
  }

  statusBadgeClass(status: SaleStatus | undefined): string {
    switch (status) {
      case SaleStatus.PAID: return 'badge bg-success';
      case SaleStatus.PARTIAL: return 'badge bg-warning text-dark';
      case SaleStatus.PENDING: return 'badge bg-secondary';
      case SaleStatus.CANCELLED: return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }

}
