import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PurchaseService } from '../../../services/purchase.service';
import { PurchaseRequest } from '../../../model/purchase.model';
import { SupplierService } from '../../../services/supplier.service';
import { SupplierResponseModel } from '../../../model/supplier.model';
import { WarehouseService } from '../../../services/warehouse-service';
import { WarehouseResponse } from '../../../model/warehouse.model';


interface DropdownOption {
  id: number;
  name: string;
}



@Component({
  selector: 'app-purchase-form-component',
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './purchase-form-component.html',
  styleUrl: './purchase-form-component.css',
})
export class PurchaseFormComponent {

 form: FormGroup;
  isEditMode = false;
  purchaseId: number | null = null;
  loading = false;
  saving = false;
  errorMessage = '';



  // Replace these with real calls to your SupplierService / WarehouseService
  suppliers: SupplierResponseModel[] = [];
  warehouses: WarehouseResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private warehouseService: WarehouseService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.form = this.fb.group({
      supplierId: [null, Validators.required],
      warehouseId: [null, Validators.required],
      // totalAmount is derived from PurchaseItems on the backend
      // (see PurchaseItemServiceImpl.recalculatePurchaseTotal). It is
      // read-only here and only ever sent back unchanged on edit, never
      // typed in by the user, so it can't be accidentally overwritten.
      totalAmount: [{ value: 0, disabled: true }],
      paidAmount: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadDropdowns();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.purchaseId = Number(idParam);
      this.loadPurchase(this.purchaseId);
    }
    this.loadSuppliers();
    this.loadWarehouses();
  }



  
 loadWarehouses() {
    this.warehouseService.getAll().subscribe({
      next: (res) => {
        this.warehouses = res,
          this.cdr.markForCheck();
          console.log(this.warehouses)
      }
    });
  }

  
  loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (res) => {
        this.suppliers = res;
         this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Load Suppliers Error', err);
      }
    });
  }


  private loadDropdowns(): void {




    // TODO: replace with this.supplierService.getAll().subscribe(...)
    //       and this.warehouseService.getAll().subscribe(...)
  }

  private loadPurchase(id: number): void {
    this.loading = true;
    this.purchaseService.getById(id).subscribe({
      next: (purchase) => {
        this.form.patchValue({
          supplierId: purchase.supplierId,
          warehouseId: purchase.warehouseId,
          totalAmount: purchase.totalAmount,
          paidAmount: purchase.paidAmount
        });
        this.cdr.detectChanges();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load purchase.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // getRawValue() includes the disabled totalAmount control so it's
    // sent back unchanged instead of being lost/overwritten.
    const raw = this.form.getRawValue();
    const request: PurchaseRequest = {
      supplierId: raw.supplierId,
      warehouseId: raw.warehouseId,
    
      totalAmount: this.isEditMode ? raw.totalAmount : 0,
      paidAmount: raw.paidAmount
    };

    this.saving = true;

    const request$ = this.isEditMode && this.purchaseId
      ? this.purchaseService.update(this.purchaseId, request)
      : this.purchaseService.create(request);

    request$.subscribe({
      next: (purchase) => {
        this.saving = false;
        if (this.isEditMode) {
          this.router.navigate(['/purchases', purchase.id]);
        } else {
          // After creating the header, go straight to the detail page
          // to add products (PurchaseItems) to this purchase.
          this.router.navigate(['/purchases', purchase.id]);
        }
      },
      error: () => {
        this.errorMessage = 'Failed to save purchase.';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/purchases']);
  }

}
