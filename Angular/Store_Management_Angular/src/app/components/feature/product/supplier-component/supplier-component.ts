import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { SupplierService } from '../../../../services/supplier.service';
import {
  SupplierRequestModel,
  SupplierResponseModel
} from '../../../../model/supplier.model';

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './supplier-component.html',
  styleUrl: './supplier-component.css'
})
export class SupplierComponent implements OnInit {

  private service = inject(SupplierService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  suppliers: SupplierResponseModel[] = [];

  isEdit = false;
  editId = 0;

  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.service.getAllSuppliers().subscribe({
      next: (res) => {
        this.suppliers = res;
         this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Load Suppliers Error', err);
      }
    });
  }

  save(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const supplier = this.form.getRawValue() as SupplierRequestModel;

    if (this.isEdit) {

      this.service.updateSupplier(this.editId, supplier).subscribe({
        next: () => {
          alert('Supplier Updated Successfully');
          this.resetForm();
          this.loadSuppliers();
        },
        error: (err) => {
          console.error(err);
        }
      });

    } else {

      this.service.createSupplier(supplier).subscribe({
        next: () => {
          alert('Supplier Saved Successfully');
          this.resetForm();
          this.loadSuppliers();
        },
        error: (err) => {
          console.error(err);
        }
      });

    }

  }

  edit(supplier: SupplierResponseModel): void {

    this.isEdit = true;
    this.editId = supplier.id;

    this.form.patchValue({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address
    });

  }

  delete(id: number): void {

    if (!confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    this.service.deleteSupplier(id).subscribe({
      next: () => {
        alert('Supplier Deleted Successfully');
        this.loadSuppliers();
      },
      error: (err) => {
        console.error(err);
      }
    });

  }

  resetForm(): void {
    this.form.reset();

    this.isEdit = false;
    this.editId = 0;
  }

}