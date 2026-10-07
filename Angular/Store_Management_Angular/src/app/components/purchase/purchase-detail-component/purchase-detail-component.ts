import { ChangeDetectorRef, Component } from '@angular/core';
import { Purchase, PurchaseStatus } from '../../../model/purchase.model';
import { PurchaseItem, PurchaseItemDraft, PurchaseItemRequest } from '../../../model/purchase-item.model';
import { PurchaseItemService } from '../../../services/purchase-item.service';
import { PurchaseService } from '../../../services/purchase.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ProductResponseModel } from '../../../model/product.model';

interface ProductOption {
  id: number;
  name: string;
  costPrice: number;
}


@Component({
  selector: 'app-purchase-detail-component',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './purchase-detail-component.html',
  styleUrl: './purchase-detail-component.css',
})
export class PurchaseDetailComponent {

  purchaseId!: number;
  purchase: Purchase | null = null;
  items: PurchaseItem[] = [];

  products: ProductResponseModel[] = []; // TODO: load from ProductService.getAll()

  loading = false;
  errorMessage = '';
  successMessage = '';

  // Rows currently being added (batch add grid)
  draftItems: PurchaseItemDraft[] = [];

  // Inline edit state for an existing item
  editingItemId: number | null = null;
  editQuantity: number | null = null;
  editCostPrice: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private purchaseService: PurchaseService,
    private purchaseItemService: PurchaseItemService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef

  ) { }

  ngOnInit(): void {
    this.purchaseId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadPurchase();
    this.loadItems();
    this.addDraftRow();
    this.loadProducts();
  }

  loadPurchase(): void {
    this.purchaseService.getById(this.purchaseId).subscribe({
      next: (data) => {
        (this.purchase = data);
        this.cdr.markForCheck()
      },
      error: () => (this.errorMessage = 'Failed to load purchase.')
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


  loadItems(): void {
    this.loading = true;
    this.purchaseItemService.getByPurchaseId(this.purchaseId).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load purchase items.';
        this.loading = false;
      }
    });
  }

  // ---------- Batch add rows ----------

  addDraftRow(): void {
    this.draftItems.push({ productId: null, quantity: null, costPrice: null });
  }

  removeDraftRow(index: number): void {
    this.draftItems.splice(index, 1);
  }

  onDraftProductChange(row: PurchaseItemDraft): void {
    const product = this.products.find((p) => p.id === row.productId);
    if (product && !row.costPrice) {
      row.costPrice = product.costPrice;
    }
  }

  get canSubmitDraft(): boolean {
    return this.draftItems.some(
      (r) => r.productId && r.quantity && r.quantity > 0 && r.costPrice !== null && r.costPrice >= 0
    );
  }

  submitDraftItems(): void {
    const validRows = this.draftItems.filter(
      (r) => r.productId && r.quantity && r.quantity > 0 && r.costPrice !== null && r.costPrice! >= 0
    );

    if (validRows.length === 0) {
      return;
    }

    const requests: PurchaseItemRequest[] = validRows.map((r) => ({
      purchaseId: this.purchaseId,
      productId: r.productId!,
      quantity: r.quantity!,
      costPrice: r.costPrice!
    }));

    this.errorMessage = '';
    this.purchaseItemService.createBatch(this.purchaseId, requests).subscribe({
      next: () => {
        this.successMessage = `${requests.length} item(s) added.`;
        this.draftItems = [];
        this.addDraftRow();
        this.loadItems();
        this.loadPurchase(); // totalAmount/status changed on the backend
      },
      error: (err) => {
        // Surfaces backend "Insufficient stock" / not-found messages if any
        this.errorMessage = err?.error?.message || 'Failed to add items. Please check product IDs and quantities.';
      }
    });
  }

  // ---------- Inline edit existing item ----------

  startEdit(item: PurchaseItem): void {
    this.editingItemId = item.id;
    this.editQuantity = item.quantity;
    this.editCostPrice = item.costPrice;
  }

  cancelEdit(): void {
    this.editingItemId = null;
  }

  saveEdit(item: PurchaseItem): void {
    if (!this.editQuantity || this.editQuantity <= 0 || this.editCostPrice === null || this.editCostPrice < 0) {
      return;
    }

    const request: PurchaseItemRequest = {
      purchaseId: this.purchaseId,
      productId: item.productId,
      quantity: this.editQuantity,
      costPrice: this.editCostPrice
    };

    this.purchaseItemService.update(item.id, request).subscribe({
      next: () => {
        this.editingItemId = null;
        this.loadItems();
        this.loadPurchase();
      },
      error: () => (this.errorMessage = 'Failed to update item.')
    });
  }

  deleteItem(item: PurchaseItem): void {
    if (!confirm(`Remove ${item.productName} from this purchase?`)) {
      return;
    }
    this.purchaseItemService.delete(item.id).subscribe({
      next: () => {
        this.loadItems();
        this.loadPurchase();
      },
      error: () => (this.errorMessage = 'Failed to delete item.')
    });
  }

  statusBadgeClass(status: PurchaseStatus | undefined): string {
    switch (status) {
      case PurchaseStatus.PAID: return 'badge bg-success';
      case PurchaseStatus.PARTIAL: return 'badge bg-warning text-dark';
      case PurchaseStatus.PENDING: return 'badge bg-secondary';
      case PurchaseStatus.CANCELLED: return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }
}
