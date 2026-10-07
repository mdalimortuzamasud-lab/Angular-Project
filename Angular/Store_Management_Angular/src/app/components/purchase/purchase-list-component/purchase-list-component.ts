import { ChangeDetectorRef, Component } from '@angular/core';
import { Purchase, PurchaseStatus } from '../../../model/purchase.model';
import { PurchaseService } from '../../../services/purchase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-purchase-list-component',
   imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './purchase-list-component.html',
  styleUrl: './purchase-list-component.css',
})
export class PurchaseListComponent {
 purchases: Purchase[] = [];
  loading = false;
  errorMessage = '';

  // For the status filter dropdown
  statuses = Object.values(PurchaseStatus);
  selectedStatus: PurchaseStatus | '' = '';

  constructor(private purchaseService: PurchaseService, private cdr:ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.purchaseService.getAll().subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
        this.cdr.markForCheck();

      },
      error: () => {
        this.errorMessage = 'Failed to load purchases.';
        this.loading = false;
      }
    });
  }

  onStatusFilterChange(): void {
    if (!this.selectedStatus) {
      this.loadAll();
      return;
    }
    this.loading = true;
    this.purchaseService.getByStatus(this.selectedStatus).subscribe({
      next: (data) => {
        this.purchases = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to filter purchases.';
        this.loading = false;
      }
    });
  }

  deletePurchase(purchase: Purchase): void {
    if (!confirm(`Delete purchase #${purchase.id} from ${purchase.supplierName}?`)) {
      return;
    }
    this.purchaseService.delete(purchase.id).subscribe({
      next: () => this.loadAll(),
      error: () => (this.errorMessage = 'Failed to delete purchase.')
    });
  }

  statusBadgeClass(status: PurchaseStatus): string {
    switch (status) {
      case PurchaseStatus.PAID: return 'badge bg-success';
      case PurchaseStatus.PARTIAL: return 'badge bg-warning text-dark';
      case PurchaseStatus.PENDING: return 'badge bg-secondary';
      case PurchaseStatus.CANCELLED: return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }

}
