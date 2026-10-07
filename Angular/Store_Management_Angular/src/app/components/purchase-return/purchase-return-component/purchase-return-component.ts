import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PurchaseReturnService } from '../../../services/purchase-return.service';
import { PurchaseService } from '../../../services/purchase.service';
import { ProductService } from '../../../services/product.service';
import { PurchaseItemService } from '../../../services/purchase-item.service';
import { SupplierService } from '../../../services/supplier.service';

import {
  PurchaseReturnRequest,
  PurchaseReturnResponse,
  PurchaseReturnItemRequest
} from '../../../model/purchase-return.model';
import { SupplierResponseModel } from '../../../model/supplier.model';
import { PurchaseItem } from '../../../model/purchase-item.model';
import { ProductResponseModel } from '../../../model/product.model';
import { Purchase } from '../../../model/purchase.model';


@Component({
  selector: 'app-purchase-return',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './purchase-return-component.html',
  styleUrls: ['./purchase-return-component.css']
})
export class PurchaseReturnComponent implements OnInit {
  // Still supports being embedded as a child component with this bound directly.
  @Input() purchaseId!: number;

  purchaseReturnForm!: FormGroup;
  purchaseReturns: PurchaseReturnResponse[] = [];
  returnItems: PurchaseReturnItemRequest[] = [];
  suppliers: SupplierResponseModel[] = [];

  // Real purchases (dropdown source) instead of hardcoded fake data
  purchases: Purchase[] = [];

  // Kept only as a fallback / for anything unrelated to a specific purchase
  products: ProductResponseModel[] = [];

  editId: number | null = null;

  // Items that actually belong to the currently selected purchase.
  // This is the ONLY source used for the "product to return" dropdown.
  items: PurchaseItem[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private purchaseReturnService: PurchaseReturnService,
    private supplierService: SupplierService,
    private purchaseService: PurchaseService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private purchaseItemService: PurchaseItemService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.loadPurchaseReturns();
    this.loadPurchases();
    this.loadProducts();
    this.loadSuppliers();

    // FALLBACK: if purchaseId wasn't passed in as an @Input (e.g. this
    // component is loaded directly via a route like /purchase-return/:purchaseId
    // rather than embedded inside a parent with [purchaseId]="..."), pull it
    // from the route params instead. This is what was causing the blank page:
    // the @Input stayed undefined forever when navigated to directly.
    if (!this.purchaseId) {
      const routeId = this.route.snapshot.paramMap.get('purchaseId');
      if (routeId) {
        this.purchaseId = Number(routeId);
      }
    }

    if (this.purchaseId) {
      this.purchaseReturnForm.patchValue({ purchaseId: this.purchaseId });
      this.loadItems(this.purchaseId);
    }

    // Whenever the user picks a different Purchase in the dropdown,
    // reload that purchase's actual items so the product list below
    // only ever shows products that were really bought on that purchase.
    this.purchaseReturnForm.get('purchaseId')?.valueChanges.subscribe((id) => {
      this.returnItems = [];
      if (id) {
        this.loadItems(Number(id));
      } else {
        this.items = [];
      }
    });
  }

  loadItems(purchaseId: number): void {
    this.loading = true;
    this.error = null;

    this.purchaseItemService.getByPurchaseId(purchaseId).subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
        this.cdr.markForCheck();
        console.log(this.items)
      },
      error: (err) => {
        this.error = 'Failed to load purchase items.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Looks up the purchased-item record for a given product, so we know
  // its cost price and how much of it was actually bought.
  getPurchasedItem(productId: number): PurchaseItem | undefined {
    return this.items.find(i => i.productId === Number(productId));
  }

  // Total refund value = for each return line, quantity x that product's
  // original cost price on this purchase (not just raw quantity summed).
  get totalCost(): number {
    return this.returnItems.reduce((sum, line) => {
      const purchased = this.getPurchasedItem(line.productId);
      const costPrice = purchased ? purchased.costPrice : 0;
      return sum + (Number(line.quantity) || 0) * costPrice;
    }, 0);
  }

  loadSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (res) => {
        this.suppliers = res;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Load Suppliers Error', err)
    });
  }

  createForm() {
    this.purchaseReturnForm = this.fb.group({
      purchaseId: ['', Validators.required],
      totalAmount: [0, Validators.required]
    });
  }

  addItem() {
    if (this.items.length === 0) {
      alert('Select a Purchase first — you can only return products that were part of it.');
      return;
    }
    this.returnItems.push({
      purchaseReturnId: 0,
      productId: 0,
      quantity: 0
    });
  }

  removeItem(index: number) {
    this.returnItems.splice(index, 1);
    this.calculateTotal();
  }

  // Prevents returning more than was actually purchased for that product.
  onQuantityChange(line: PurchaseReturnItemRequest) {
    const purchased = this.getPurchasedItem(line.productId);
    if (purchased && Number(line.quantity) > Number(purchased.quantity)) {
      alert(`Cannot return more than the purchased quantity (${purchased.quantity}).`);
      line.quantity = purchased.quantity;
    }
    this.calculateTotal();
  }

  calculateTotal() {
    this.purchaseReturnForm.patchValue({
      totalAmount: this.totalCost
    });
  }

  save() {
    if (this.purchaseReturnForm.invalid || this.returnItems.length === 0) {
      alert('Please select a purchase and add at least one return item.');
      return;
    }

    const hasInvalidLine = this.returnItems.some(
      item => !item.productId || item.quantity <= 0
    );
    if (hasInvalidLine) {
      alert('Please select a product and a quantity greater than 0 for every return line.');
      return;
    }

    const request: PurchaseReturnRequest = this.purchaseReturnForm.value;

    this.purchaseReturnService.createPurchaseReturn(request).subscribe({
      next: (response) => {
        this.returnItems.forEach(item => {
          item.purchaseReturnId = response.id;
          this.purchaseReturnService.createPurchaseReturnItem(item).subscribe();
        });
        alert('Purchase Return Saved Successfully');
        this.loadPurchaseReturns();
        this.reset();
      },
      error: () => alert('Save Failed')
    });
  }

  loadPurchaseReturns() {
    this.purchaseReturnService.getAllPurchaseReturns().subscribe(res => {
      {this.purchaseReturns = res, this.cdr.markForCheck()}
    });
  }

  edit(data: PurchaseReturnResponse) {
    this.editId = data.id;
    this.purchaseReturnForm.patchValue({
      purchaseId: data.purchaseId,
      totalAmount: data.totalAmount
    });

    // Loading the purchase's items happens automatically via the
    // purchaseId valueChanges subscription above.

    this.purchaseReturnService.getPurchaseReturnItemsByPurchaseReturnId(data.id).subscribe(items => {
      this.returnItems = items.map(x => ({
        purchaseReturnId: x.purchaseReturnId,
        productId: x.productId,
        quantity: x.quantity
       
      }));
    });
  }

  reset() {
    this.editId = null;
    this.purchaseReturnForm.reset({
      purchaseId: '',
      totalAmount: 0
    });
    this.returnItems = [];
    this.items = [];
  }

  // Real purchases, loaded from the backend instead of a hardcoded array.
  loadPurchases(): void {
    this.purchaseService.getAll().subscribe({
      next: (res) => (this.purchases = res, this.cdr.markForCheck()),
      error: (err) => console.error('Load Purchases Error', err)
    });
  }

  // Kept for completeness, but the return-items dropdown uses `this.items`
  // (the selected purchase's actual line items), not this full product list.
  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (res) => (this.products = res, this.cdr.markForCheck()),
      error: (err) => console.error('Load Products Error', err)
    });
  }

  getPurchaseName(purchaseId: number): string {
    const purchase = this.purchases.find(p => p.id === Number(purchaseId));
    return purchase ? `Purchase #${purchase.id} - ${purchase.supplierName}` : 'N/A';
  }

  getMaxQuantity(productId: number): number | null {
    const purchased = this.getPurchasedItem(productId);
    return purchased ? purchased.quantity : null;
  }
}