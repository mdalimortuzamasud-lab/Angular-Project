import { ChangeDetectorRef, Component } from '@angular/core';
import { Sale, SaleStatus } from '../../../../model/sale.model';
import { SaleService } from '../../../../services/sale.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sale-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sale-list.html',
  styleUrl: './sale-list.css',
})
export class SaleList {

  allSales: Sale[] = [];
  loading = false;
  errorMessage = '';

  // Backend has no GET-by-status endpoint for Sale (unlike Purchase),
  // so this filter is applied client-side over the full list.
  statuses = Object.values(SaleStatus);
  selectedStatus: SaleStatus | '' = '';

  constructor(private saleService: SaleService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.saleService.getAll().subscribe({
      next: (data) => {
        this.allSales = data;
        this.loading = false;
        this.cdr.markForCheck();
        
      },
      error: () => {
        this.errorMessage = 'Failed to load sales.';
        this.loading = false;
      }
    });
  }

  get filteredSales(): Sale[] {
    if (!this.selectedStatus) {
      return this.allSales;
    }
    return this.allSales.filter((s) => s.status === this.selectedStatus);
  }

  deleteSale(sale: Sale): void {
    if (!confirm(`Delete sale #${sale.id} for ${sale.customerName}?`)) {
      return;
    }
    this.saleService.delete(sale.id).subscribe({
      next: () => this.loadAll(),
      error: () => (this.errorMessage = 'Failed to delete sale.')
    });
  }

  statusBadgeClass(status: SaleStatus): string {
    switch (status) {
      case SaleStatus.PAID: return 'badge bg-success';
      case SaleStatus.PARTIAL: return 'badge bg-warning text-dark';
      case SaleStatus.PENDING: return 'badge bg-secondary';
      case SaleStatus.CANCELLED: return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }

}
