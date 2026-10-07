import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { SupplierPaymentService } from '../../../../services/supplier-payment.service';
import { SupplierService } from '../../../../services/supplier.service';

import {
  PaymentMethod,
  SupplierPaymentRequestModel,
  SupplierPaymentResponseModel
} from '../../../../model/supplier-payment.model';

import {
  Purchase,
  PurchaseStatus
} from '../../../../model/purchase.model';

import { SupplierResponseModel } from '../../../../model/supplier.model';


@Component({
  selector: 'app-supplier-payment',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './supplier-payment-component.html',
  styleUrls: ['./supplier-payment-component.css']
})
export class SupplierPaymentComponent implements OnInit {

  // =====================================================
  // INJECT SERVICES
  // =====================================================

  private fb = inject(FormBuilder);
  private service = inject(SupplierPaymentService);
  private supplierService = inject(SupplierService);
  private cdr = inject(ChangeDetectorRef);

  // =====================================================
  // FORMS
  // =====================================================

  paymentForm!: FormGroup;

  // =====================================================
  // DATA
  // =====================================================

  suppliers: SupplierResponseModel[] = [];
  payments: SupplierPaymentResponseModel[] = [];
  purchases: Purchase[] = [];

  // =====================================================
  // PAYMENT METHODS
  // =====================================================

  paymentMethods: PaymentMethod[] = [
    'CASH',
    'CARD',
    'BANK',
    'MOBILE_BANKING'
  ];

  // =====================================================
  // PURCHASE STATUS
  // =====================================================

  purchaseStatuses: PurchaseStatus[] = [
    PurchaseStatus.PENDING,
    PurchaseStatus.PARTIAL,
    PurchaseStatus.PAID,
    PurchaseStatus.CANCELLED
  ];

  // =====================================================
  // EDIT ID & LOADING
  // =====================================================

  editPaymentId: number | null = null;
  loading = false;

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
    this.createForm();
    this.refreshAllData(); // Load all data initially
  }

  // =====================================================
  // CREATE FORM
  // =====================================================

  createForm(): void {
    this.paymentForm = this.fb.group({
      supplierId: [
        '',
        Validators.required
      ],

      amount: [
        0,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],

      paymentMethod: [
        'CASH',
        Validators.required
      ],

      date: [
        this.getCurrentDateTime(),
        Validators.required
      ]
    });

    // =====================================================
    // Auto fill Amount based on Supplier Due / Purchases
    // =====================================================
    this.paymentForm.get('supplierId')?.valueChanges.subscribe((supplierId: string | number) => {
      if (supplierId) {
        // ১. ওই সাপ্লায়ারের সকল পারচেজ (Purchases) ফিল্টার করা
        const supplierPurchases = this.purchases.filter(
          p => Number(p.supplierId) === Number(supplierId)
        );

        // ২. মোট বাকি (Total Due) হিসাব করা: (totalAmount - paidAmount)
        const totalDue = supplierPurchases.reduce((sum, p) => {
          const due = (p.totalAmount || 0) - (p.paidAmount || 0);
          return sum + (due > 0 ? due : 0);
        }, 0);

        // ৩. যদি Purchase লিস্টে বাকি পাওয়া যায় তবে সেটি বসাবে, অন্যথায় Supplier Object-এর প্রপার্টি থেকে চেষ্টা করবে
        if (totalDue > 0) {
          this.paymentForm.patchValue({ amount: totalDue }, { emitEvent: false });
        } else {
          const selectedSupplier = this.suppliers.find(
            s => Number(s.id) === Number(supplierId)
          ) as any;

          const autoAmount = selectedSupplier?.dueAmount ?? selectedSupplier?.due ?? selectedSupplier?.balance ?? 0;
          this.paymentForm.patchValue({ amount: autoAmount }, { emitEvent: false });
        }
      } else {
        this.paymentForm.patchValue({ amount: 0 }, { emitEvent: false });
      }
    });
  }

  // =====================================================
  // REFRESH ALL DATA (Fix for table update)
  // =====================================================

  refreshAllData(): void {
    this.loadSuppliers();
    this.loadPayments();
    this.loadPurchases();
  }

  // =====================================================
  // CURRENT DATE TIME
  // =====================================================

  getCurrentDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // =====================================================
  // LOAD SUPPLIERS
  // =====================================================

  loadSuppliers(): void {
    this.supplierService
      .getAllSuppliers()
      .subscribe({
        next: (res: SupplierResponseModel[]) => {
          this.suppliers = res;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load suppliers', err);
        }
      });
  }

  // =====================================================
  // LOAD PAYMENTS
  // =====================================================

  loadPayments(): void {
    this.loading = true;
    this.service
      .getAllPayments()
      .subscribe({
        next: (res: SupplierPaymentResponseModel[]) => {
          this.payments = res;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load payments', err);
          this.loading = false;
        }
      });
  }

  // =====================================================
  // LOAD PURCHASES
  // =====================================================

  loadPurchases(): void {
    this.service
      .getAllPurchases()
      .subscribe({
        next: (res: Purchase[]) => {
          this.purchases = res;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Failed to load purchases', err);
        }
      });
  }

  // =====================================================
  // SAVE PAYMENT
  // =====================================================

  savePayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const rawValue = this.paymentForm.getRawValue();
    const payment: SupplierPaymentRequestModel = {
      ...rawValue,
      supplierId: Number(rawValue.supplierId) // Ensuring number format
    };

    // UPDATE
    if (this.editPaymentId !== null) {
      this.service
        .updatePayment(this.editPaymentId, payment)
        .subscribe({
          next: () => {
            alert('Supplier Payment Updated Successfully');
            this.resetPaymentForm();
            this.refreshAllData(); // Refresh supplier, purchase and payment tables
          },
          error: (err: any) => {
            console.error(err);
            alert('Failed to update payment');
          }
        });
      return;
    }

    // CREATE
    this.service
      .createPayment(payment)
      .subscribe({
        next: () => {
          alert('Supplier Payment Saved Successfully');
          this.resetPaymentForm();
          this.refreshAllData(); // Refresh supplier, purchase and payment tables
        },
        error: (err: any) => {
          console.error(err);
          alert('Failed to save payment');
        }
      });
  }

  // =====================================================
  // EDIT PAYMENT
  // =====================================================

  editPayment(payment: SupplierPaymentResponseModel): void {
    this.editPaymentId = payment.id;

    this.paymentForm.patchValue({
      supplierId: payment.supplierId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      date: this.formatDateForInput(payment.date)
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // =====================================================
  // DELETE PAYMENT
  // =====================================================

  deletePayment(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this payment?');

    if (!confirmed) {
      return;
    }

    this.service
      .deletePayment(id)
      .subscribe({
        next: () => {
          alert('Supplier Payment Deleted Successfully');
          this.refreshAllData(); // Refresh all tables on delete
        },
        error: (err: any) => {
          console.error(err);
          alert('Failed to delete payment');
        }
      });
  }

  // =====================================================
  // RESET PAYMENT FORM
  // =====================================================

  resetPaymentForm(): void {
    this.editPaymentId = null;

    this.paymentForm.reset({
      supplierId: '',
      amount: 0,
      paymentMethod: 'CASH',
      date: this.getCurrentDateTime()
    });
  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDateForInput(date: string): string {
    if (!date) {
      return this.getCurrentDateTime();
    }
    return date.substring(0, 16);
  }

  // =====================================================
  // SUPPLIER NAME
  // =====================================================

  getSupplierName(supplierId: number): string {
    const supplier = this.suppliers.find(
      s => Number(s.id) === Number(supplierId)
    );

    return supplier ? supplier.name : 'N/A';
  }

  // =====================================================
  // PURCHASE STATUS CLASS
  // =====================================================

  getStatusClass(status: PurchaseStatus): string {
    return status.toLowerCase();
  }
}