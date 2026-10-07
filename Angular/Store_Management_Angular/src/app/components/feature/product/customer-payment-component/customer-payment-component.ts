import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CustomerPaymentService } from '../../../../services/customer-payment.service';
import { CustomerService } from '../../../../services/customer.service';

import {
  CustomerPaymentRequestModel,
  CustomerPaymentResponseModel,
  PaymentMethod,
  Sale,
  SaleStatus
} from '../../../../model/customer-payment.model';

import { CustomerResponseModel } from '../../../../model/customer.model';

@Component({
  selector: 'app-customer-payment',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule
  ],

  templateUrl: './customer-payment-component.html',
  styleUrls: ['./customer-payment-component.css']
})
export class CustomerPaymentComponent implements OnInit {

  // =====================================================
  // SERVICES
  // =====================================================

  private fb = inject(FormBuilder);
  private service = inject(CustomerPaymentService);
  private customerService = inject(CustomerService);
  private cdr = inject(ChangeDetectorRef);

  // =====================================================
  // FORM
  // =====================================================

  paymentForm!: FormGroup;

  // =====================================================
  // DATA
  // =====================================================

  customers: CustomerResponseModel[] = [];
  payments: CustomerPaymentResponseModel[] = [];
  sales: Sale[] = [];

  // =====================================================
  // PAYMENT METHODS
  // =====================================================

  paymentMethods: PaymentMethod[] = [
    PaymentMethod.CASH,
    PaymentMethod.CARD,
    PaymentMethod.BANK,
    PaymentMethod.MOBILE_BANKING
  ];

  // =====================================================
  // SALE STATUS
  // =====================================================

  saleStatuses: SaleStatus[] = [
    SaleStatus.PENDING,
    SaleStatus.PARTIAL,
    SaleStatus.PAID,
    SaleStatus.CANCELLED
  ];

  // =====================================================
  // EDIT / LOADING
  // =====================================================

  editPaymentId: number | null = null;

  loading = false;

  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.createForm();

    this.refreshAllData();

  }

  // =====================================================
  // CREATE FORM
  // =====================================================

  createForm(): void {

    this.paymentForm = this.fb.group({

      customerId: [
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
        PaymentMethod.CASH,
        Validators.required
      ],

      date: [
        this.getCurrentDateTime(),
        Validators.required
      ]

    });


    // =====================================================
    // AUTO CALCULATE CUSTOMER DUE
    // =====================================================

    this.paymentForm
      .get('customerId')
      ?.valueChanges
      .subscribe((customerId: string | number) => {

        if (!customerId) {

          this.paymentForm.patchValue(
            {
              amount: 0
            },
            {
              emitEvent: false
            }
          );

          return;

        }


        // Customer-এর সব Sale বের করা
        const customerSales = this.sales.filter(
          sale =>
            Number(sale.customerId) === Number(customerId)
        );


        // মোট Due হিসাব
        const totalDue = customerSales.reduce(
          (sum, sale) => {

            const due =
              (sale.totalAmount || 0) -
              (sale.paidAmount || 0);

            return sum + (due > 0 ? due : 0);

          },
          0
        );


        // Amount auto fill
        this.paymentForm.patchValue(
          {
            amount: totalDue
          },
          {
            emitEvent: false
          }
        );

      });

  }

  // =====================================================
  // REFRESH ALL DATA
  // =====================================================

  refreshAllData(): void {

    this.loadCustomers();

    this.loadPayments();

    this.loadSales();

  }

  // =====================================================
  // CURRENT DATE TIME
  // =====================================================

  getCurrentDateTime(): string {

    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        now.getDate()
      ).padStart(2, '0');

    const hours =
      String(
        now.getHours()
      ).padStart(2, '0');

    const minutes =
      String(
        now.getMinutes()
      ).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;

  }

  // =====================================================
  // LOAD CUSTOMERS
  // =====================================================

  loadCustomers(): void {

    this.customerService
      .getAllCustomers()
      .subscribe({

        next: (
          res: CustomerResponseModel[]
        ) => {

          this.customers = res;

          this.cdr.markForCheck();

        },

        error: (err: any) => {

          console.error(
            'Failed to load customers',
            err
          );

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

        next: (
          res: CustomerPaymentResponseModel[]
        ) => {

          this.payments = res;

          this.loading = false;

          this.cdr.markForCheck();

        },

        error: (err: any) => {

          console.error(
            'Failed to load customer payments',
            err
          );

          this.loading = false;

        }

      });

  }

  // =====================================================
  // LOAD SALES
  // =====================================================

  loadSales(): void {

    this.service
      .getAllSales()
      .subscribe({

        next: (
          res: Sale[]
        ) => {

          this.sales = res;

          this.cdr.markForCheck();

        },

        error: (err: any) => {

          console.error(
            'Failed to load sales',
            err
          );

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


    const rawValue =
      this.paymentForm.getRawValue();


    const payment:
      CustomerPaymentRequestModel = {

      customerId:
        Number(
          rawValue.customerId
        ),

      amount:
        Number(
          rawValue.amount
        ),

      paymentMethod:
        rawValue.paymentMethod,

      date:
        rawValue.date

    };


    // =====================================================
    // UPDATE
    // =====================================================

    if (
      this.editPaymentId !== null
    ) {

      this.service
        .updatePayment(
          this.editPaymentId,
          payment
        )
        .subscribe({

          next: () => {

            alert(
              'Customer Payment Updated Successfully'
            );

            this.resetPaymentForm();

            this.refreshAllData();

          },

          error: (err: any) => {

            console.error(err);

            alert(
              'Failed to update customer payment'
            );

          }

        });

      return;

    }


    // =====================================================
    // CREATE
    // =====================================================

    this.service
      .createPayment(payment)
      .subscribe({

        next: () => {

          alert(
            'Customer Payment Saved Successfully'
          );

          this.resetPaymentForm();

          this.refreshAllData();

        },

        error: (err: any) => {

          console.error(err);

          alert(
            'Failed to save customer payment'
          );

        }

      });

  }

  // =====================================================
  // EDIT PAYMENT
  // =====================================================

  editPayment(
    payment: CustomerPaymentResponseModel
  ): void {

    this.editPaymentId =
      payment.id;


    this.paymentForm.patchValue({

      customerId:
        payment.customerId,

      amount:
        payment.amount,

      paymentMethod:
        payment.paymentMethod,

      date:
        this.formatDateForInput(
          payment.date
        )

    });


    window.scrollTo({

      top: 0,

      behavior: 'smooth'

    });

  }

  // =====================================================
  // DELETE PAYMENT
  // =====================================================

  deletePayment(
    id: number
  ): void {

    const confirmed =
      confirm(
        'Are you sure you want to delete this payment?'
      );


    if (!confirmed) {

      return;

    }


    this.service
      .deletePayment(id)
      .subscribe({

        next: () => {

          alert(
            'Customer Payment Deleted Successfully'
          );

          this.refreshAllData();

        },

        error: (err: any) => {

          console.error(err);

          alert(
            'Failed to delete customer payment'
          );

        }

      });

  }

  // =====================================================
  // RESET FORM
  // =====================================================

  resetPaymentForm(): void {

    this.editPaymentId = null;


    this.paymentForm.reset({

      customerId: '',

      amount: 0,

      paymentMethod:
        PaymentMethod.CASH,

      date:
        this.getCurrentDateTime()

    });

  }

  // =====================================================
  // FORMAT DATE
  // =====================================================

  formatDateForInput(
    date: string
  ): string {

    if (!date) {

      return this.getCurrentDateTime();

    }

    return date.substring(
      0,
      16
    );

  }

  // =====================================================
  // CUSTOMER NAME
  // =====================================================

  getCustomerName(
    customerId: number
  ): string {

    const customer =
      this.customers.find(
        c =>
          Number(c.id) ===
          Number(customerId)
      );


    return customer
      ? customer.name
      : 'N/A';

  }

  // =====================================================
  // SALE STATUS CLASS
  // =====================================================

  getStatusClass(
    status: SaleStatus
  ): string {

    return status.toLowerCase();

  }

}