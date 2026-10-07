import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CustomerService } from '../../../../services/customer.service';
import { CustomerRequestModel, CustomerResponseModel } from '../../../../model/customer.model';


@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './customer-component.html'
})
export class CustomerComponent implements OnInit {

  private service = inject(CustomerService);
   private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  customers: CustomerResponseModel[] = [];

  isEdit = false;
  editId = 0;

  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.service.getAllCustomers().subscribe({
      next: (res) => {this.customers = res
      this.cdr.markForCheck();}
    });
  }

  save() {

    if (this.form.invalid) return;

    const customer = this.form.value as CustomerRequestModel;

    if (this.isEdit) {

      this.service.updateCustomer(this.editId, customer).subscribe(() => {
        this.resetForm();
        this.loadCustomers();
      });

    } else {

      this.service.createCustomer(customer).subscribe(() => {
        this.resetForm();
        this.loadCustomers();
      });

    }

  }

  edit(customer: CustomerResponseModel) {

    this.isEdit = true;
    this.editId = customer.id;

    this.form.patchValue({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address
    });

  }

  delete(id: number) {

    if (!confirm('Delete this customer?')) {
      return;
    }

    this.service.deleteCustomer(id).subscribe(() => {
      this.loadCustomers();
    });

  }

  resetForm() {

    this.form.reset();

    this.isEdit = false;
    this.editId = 0;

  }

}