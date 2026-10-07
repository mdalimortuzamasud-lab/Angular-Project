import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SaleReturnService } from '../../../../services/sale-return.service';
import { SaleService } from '../../../../services/sale.service';
import { ProductService } from '../../../../services/product.service';
import { SaleItemService } from '../../../../services/sale-item.service';
import { CustomerService } from '../../../../services/customer.service';

import {
  SaleReturnRequest,
  SaleReturnResponse,
  SaleReturnItemRequest,
  SaleReturnItemResponse
} from '../../../../model/sale-return.model';
import { SaleItem } from '../../../../model/sale-item.model';
import { ProductResponseModel } from '../../../../model/product.model';
import { Sale } from '../../../../model/sale.model';

@Component({
  selector: 'app-sale-return',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sale-return-component.html',
  styleUrls: ['./sale-return-component.css']
})
export class SaleReturnComponent implements OnInit {
  @Input() saleId!: number;

  saleReturnForm!: FormGroup;
  saleReturns: SaleReturnResponse[] = [];
  returnItems: SaleReturnItemRequest[] = [];
  customers: any[] = []; // Customer list array

  // Real sales (dropdown source)
  sales: Sale[] = [];

  // Fallback products
  products: ProductResponseModel[] = [];

  editId: number | null = null;

  // Items that belong to the currently selected sale
  items: SaleItem[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private saleReturnService: SaleReturnService,
    private customerService: CustomerService,
    private saleService: SaleService,
    private productService: ProductService,
    private saleItemService: SaleItemService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadSaleReturns();
    this.loadSales();
    this.loadProducts();
    this.loadCustomers(); // Customer data loaded

    // Route parameter fallback for saleId
    if (!this.saleId) {
      const routeId = this.route.snapshot.paramMap.get('saleId');
      if (routeId) {
        this.saleId = Number(routeId);
      }
    }

    if (this.saleId) {
      this.saleReturnForm.patchValue({ saleId: this.saleId });
      this.loadItems(this.saleId);
    }

    // Dynamic item reloading on Sale dropdown change
    this.saleReturnForm.get('saleId')?.valueChanges.subscribe((id) => {
      this.returnItems = [];
      if (id) {
        this.loadItems(Number(id));
      } else {
        this.items = [];
      }
    });
  }

  // --- Data Loader Methods ---

  loadCustomers(): void {
    // Note: If your service method is getAllCustomers(), change getCustomers() below
    this.customerService.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error fetching customers', err)
    });
  }

  loadSales(): void {
    this.saleService.getAll().subscribe({
      next: (res) => {
        this.sales = res;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Load Sales Error', err)
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (res) => {
        this.products = res;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Load Products Error', err)
    });
  }

  loadItems(saleId: number): void {
    this.loading = true;
    this.error = null;

    this.saleItemService.getBySaleId(saleId).subscribe({
      next: (res: SaleItem[]) => {
        this.items = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'Failed to load sale items.';
        console.error(err);
      }
    });
  }

  loadSaleReturns(): void {
    this.saleReturnService.getAllSaleReturns().subscribe((res) => {
      this.saleReturns = res;
      this.cdr.markForCheck();
    });
  }

  // --- Helper & Display Methods ---

  getCustomerName(customerId: number | undefined): string {
    if (!customerId) return 'N/A';

    const customer = this.customers.find((c) => c.id === Number(customerId));
    if (!customer) return `ID: ${customerId}`;

    if (customer.name) {
      return customer.name;
    } else if (customer.fullName) {
      return customer.fullName;
    } else if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    }

    return `Customer #${customerId}`;
  }

  getSaleName(saleId: number): string {
    const sale = this.sales.find((s) => s.id === Number(saleId));
    if (!sale) return 'N/A';

    const customerName = this.getCustomerName(sale.customerId);
    return `Sale #${sale.id} - ${customerName}`;
  }

  getSoldItem(productId: number): SaleItem | undefined {
    return this.items.find((i) => i.productId === Number(productId));
  }

  get totalCost(): number {
    return this.returnItems.reduce((sum, line) => {
      const sold = this.getSoldItem(line.productId);
      const salePrice = sold ? sold.sellingPrice || 0 : 0;
      return sum + (Number(line.quantity) || 0) * salePrice;
    }, 0);
  }

  getMaxQuantity(productId: number): number | null {
    const sold = this.getSoldItem(productId);
    return sold ? sold.quantity : null;
  }

  // --- Form & Action Handlers ---

  createForm(): void {
    this.saleReturnForm = this.fb.group({
      saleId: ['', Validators.required],
      totalAmount: [0, Validators.required]
    });
  }

  addItem(): void {
    if (this.items.length === 0) {
      alert('Select a Sale first — you can only return products that were part of it.');
      return;
    }
    this.returnItems.push({
      saleReturnId: 0,
      productId: 0,
      quantity: 0
    });
  }

  removeItem(index: number): void {
    this.returnItems.splice(index, 1);
    this.calculateTotal();
  }

  onQuantityChange(line: SaleReturnItemRequest): void {
    const sold = this.getSoldItem(line.productId);
    if (sold && Number(line.quantity) > Number(sold.quantity)) {
      alert(`Cannot return more than the sold quantity (${sold.quantity}).`);
      line.quantity = sold.quantity;
    }
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.saleReturnForm.patchValue({
      totalAmount: this.totalCost
    });
  }

  save(): void {
    if (this.saleReturnForm.invalid || this.returnItems.length === 0) {
      alert('Please select a sale and add at least one return item.');
      return;
    }

    const hasInvalidLine = this.returnItems.some(
      (item) => !item.productId || item.quantity <= 0
    );
    if (hasInvalidLine) {
      alert('Please select a product and a quantity greater than 0 for every return line.');
      return;
    }

    const request: SaleReturnRequest = this.saleReturnForm.value;

    this.saleReturnService.createSaleReturn(request).subscribe({
      next: (response) => {
        this.returnItems.forEach((item) => {
          item.saleReturnId = response.id;
          this.saleReturnService.createSaleReturnItem(item).subscribe();
        });
        alert('Sale Return Saved Successfully');
        this.loadSaleReturns();
        this.reset();
      },
      error: () => alert('Save Failed')
    });
  }

  edit(data: SaleReturnResponse): void {
    this.editId = data.id;
    this.saleReturnForm.patchValue({
      saleId: data.saleId,
      totalAmount: data.totalAmount
    });

    this.saleReturnService.getItemsBySaleReturnId(data.id).subscribe((items) => {
      this.returnItems = items.map((x) => ({
        saleReturnId: x.saleReturnId,
        productId: x.productId,
        quantity: x.quantity
      }));
    });
  }

  deleteSaleReturn(id: number): void {
    if (confirm('Are you sure you want to delete this sale return?')) {
      this.saleReturnService.deleteSaleReturn(id).subscribe({
        next: () => {
          alert('Sale Return deleted successfully!');
          this.loadSaleReturns();
        },
        error: (err) => {
          console.error('Delete Error', err);
          alert('Failed to delete sale return.');
        }
      });
    }
  }

  reset(): void {
    this.editId = null;
    this.saleReturnForm.reset({
      saleId: '',
      totalAmount: 0
    });
    this.returnItems = [];
    this.items = [];
  }
}