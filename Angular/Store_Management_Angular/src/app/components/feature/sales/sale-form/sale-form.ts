import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SaleRequest, SaleStatus } from '../../../../model/sale.model';
import { SaleService } from '../../../../services/sale.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomerService } from '../../../../services/customer.service';
import { WarehouseService } from '../../../../services/warehouse-service';
import { WarehouseResponse } from '../../../../model/warehouse.model';
import { CustomerResponseModel } from '../../../../model/customer.model';
import { CommonModule } from '@angular/common';



interface DropdownOption {
  id: number;
  name: string;
}


@Component({
  selector: 'app-sale-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sale-form.html',
  styleUrl: './sale-form.css',
})
export class SaleForm {

  form: FormGroup;
  isEditMode = false;
  saleId: number | null = null;
  loading = false;
  saving = false;
  errorMessage = '';

  statuses = Object.values(SaleStatus);

  // Replace with real calls to your CustomerService / WarehouseService
  customers: CustomerResponseModel[] = [];
  warehouses: WarehouseResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private customerService: CustomerService,
    private warehouseService: WarehouseService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      customerId: [null, Validators.required],
      warehouseId: [null, Validators.required],
      // totalAmount is derived from SaleItems on the backend
      // (SaleItemServiceImpl.recalculateSaleTotal). Read-only here and
      // only ever sent back unchanged on edit.
      totalAmount: [{ value: 0, disabled: true }],
      paidAmount: [0, [Validators.required, Validators.min(0)]],
      status: [SaleStatus.PENDING, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDropdowns();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.saleId = Number(idParam);
      this.loadSale(this.saleId);
      this.cdr.markForCheck();
    }
  }

  private loadDropdowns(): void {
    this.loadWarehouses();
    this.loadCustomers();
  }


  loadWarehouses() {
    this.warehouseService.getAll().subscribe({
      next: (res) => {
        this.warehouses = res,
          this.cdr.markForCheck();
      }
    });
  }


  loadCustomers() {
    this.customerService.getAllCustomers().subscribe({
      next: (res) => {
        this.customers = res
        this.cdr.markForCheck();
      }
    });
  }


  private loadSale(id: number): void {
    this.loading = true;
    this.saleService.getById(id).subscribe({
      next: (sale) => {
        this.form.patchValue({
          customerId: sale.customerId,
          warehouseId: sale.warehouseId,
          totalAmount: sale.totalAmount,
          paidAmount: sale.paidAmount,
          status: sale.status
        });
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load sale.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const request: SaleRequest = {
      customerId: raw.customerId,
      warehouseId: raw.warehouseId,
      totalAmount: this.isEditMode ? raw.totalAmount : 0,
      paidAmount: raw.paidAmount,
      status: raw.status
    };

    this.saving = true;

    const request$ = this.isEditMode && this.saleId
      ? this.saleService.update(this.saleId, request)
      : this.saleService.create(request);

    request$.subscribe({
      next: (sale) => {
        this.saving = false;
        // Either way, go to the detail page — for a new sale that's
        // where products get added; for an edit it's a natural place to land.
        this.router.navigate(['/sales', sale.id]);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to save sale.';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/sales']);
  }

}
