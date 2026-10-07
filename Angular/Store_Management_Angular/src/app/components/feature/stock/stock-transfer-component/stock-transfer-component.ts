import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { StockTransferService } from '../../../../services/stock-transfer.service';
import { WarehouseService } from '../../../../services/warehouse-service';
import { InventoryService } from '../../../../services/inventory.service';

import {
  StockTransferRequestModel,
  StockTransferResponseModel,
  StockTransferItemRequestModel,
  StockTransferItemResponseModel,
  StockTransferStatus
} from '../../../../model/stock-transfer.model';

import { WarehouseResponse } from '../../../../model/warehouse.model';

@Component({
  selector: 'app-stock-transfer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './stock-transfer-component.html',
  styleUrls: ['./stock-transfer-component.css']
})
export class StockTransferComponent implements OnInit {

  // =========================================================
  // FORM & DATA
  // =========================================================
  stockTransferForm!: FormGroup;

  stockTransfers: StockTransferResponseModel[] = [];
  warehouses: WarehouseResponse[] = [];
  
  inventoryList: any[] = []; 
  filteredProducts: any[] = [];

  stockTransferStatuses = Object.values(StockTransferStatus);

  // =========================================================
  // STATE
  // =========================================================
  editId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private stockTransferService: StockTransferService,
    private warehouseService: WarehouseService,
    private inventoryService: InventoryService,
    private cdr: ChangeDetectorRef
  ) {}

  // =========================================================
  // INIT
  // =========================================================
  ngOnInit(): void {
    this.createForm();
    this.loadStockTransfers();
    this.loadWarehouses();
    this.loadInventoryData();
    this.listenToFromWarehouseChange();
  }

  // =========================================================
  // CREATE FORM
  // =========================================================
  createForm(): void {
    this.stockTransferForm = this.fb.group({
      fromWarehouseId: ['', Validators.required],
      toWarehouseId: ['', Validators.required],
      status: [StockTransferStatus.PENDING, Validators.required],
      items: this.fb.array([])
    });
  }

  // =========================================================
  // LISTEN TO FROM WAREHOUSE CHANGE
  // =========================================================
  private listenToFromWarehouseChange(): void {
    this.stockTransferForm
      .get('fromWarehouseId')
      ?.valueChanges.subscribe((warehouseId) => {

        if (warehouseId) {
          this.filterProductsByWarehouse(warehouseId);
        } else {
          this.filteredProducts = [];
        }

        if (this.editId === null) {
          this.items.clear();
          if (warehouseId && this.filteredProducts.length > 0) {
            this.addItem();
          }
        }

        this.cdr.detectChanges();
      });
  }

  // =========================================================
  // INVENTORY অনুযায়ী PRODUCT FILTER (INVENTORY BASED UPDATE)
  // =========================================================
  private filterProductsByWarehouse(warehouseId: string | number): void {
    const targetId = Number(warehouseId);

    if (!targetId || isNaN(targetId)) {
      this.filteredProducts = [];
      return;
    }

    const selectedWarehouse = this.warehouses.find(w => Number(w.id) === targetId);
    const selectedWarehouseName = selectedWarehouse ? selectedWarehouse.name.trim().toLowerCase() : '';

    // সিলেক্ট করা ওয়ারহাউসের সকল ইনভেন্টরি আইটেম বের করা
    const matchedItems = this.inventoryList.filter((item: any) => {
      const itemWarehouseId = item.warehouseId ?? item.warehouse_id ?? item.warehouse?.id;
      const itemWarehouseName = item.warehouseName ?? item.warehouse?.name ?? item.warehouse;

      if (itemWarehouseId && Number(itemWarehouseId) === targetId) {
        return true;
      }
      if (itemWarehouseName && String(itemWarehouseName).trim().toLowerCase() === selectedWarehouseName) {
        return true;
      }

      return false;
    });

    const uniqueMap = new Map();
    matchedItems.forEach((item: any) => {
      const pId = item.productId ?? item.product_id ?? item.product?.id ?? item.id;
      const pName = item.productName ?? item.product?.name ?? item.product ?? item.name;
      // ইনভেন্টরির কারেন্ট স্টক
      const availableQty = item.available ?? item.quantity ?? item.stock ?? 0;

      // শুধুমাত্র যে প্রোডাক্টগুলোর স্টক ০ এর বেশি আছে অথবা ইনভেন্টরিতে রেকর্ড আছে
      if (pId && !uniqueMap.has(pId)) {
        uniqueMap.set(pId, {
          id: pId,
          name: pName,
          availableQuantity: Number(availableQty)
        });
      }
    });

    this.filteredProducts = Array.from(uniqueMap.values());
    this.cdr.detectChanges();
  }

  // =========================================================
  // FORM ARRAY
  // =========================================================
  get items(): FormArray {
    return this.stockTransferForm.get('items') as FormArray;
  }

  createItemFormGroup(
    productId: string = '',
    quantity: number = 1
  ): FormGroup {
    return this.fb.group({
      productId: [productId, Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(1)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItemFormGroup());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  // =========================================================
  // LOAD DATA SERVICES
  // =========================================================
  loadStockTransfers(): void {
    this.loading = true;
    this.stockTransferService.getAllStockTransfers().subscribe({
      next: (response: StockTransferResponseModel[]) => {
        this.stockTransfers = response;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load stock transfers.';
        console.error('Stock Transfer Load Error:', err);
      }
    });
  }

  loadWarehouses(): void {
    this.warehouseService.getAll().subscribe({
      next: (response: WarehouseResponse[]) => {
        this.warehouses = response;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Warehouse Load Error:', err);
      }
    });
  }

  loadInventoryData(): void {
    const serviceAny = this.inventoryService as any;

    const inventoryObservable = serviceAny.getAll 
      ? serviceAny.getAll() 
      : (serviceAny.getInventories 
          ? serviceAny.getInventories() 
          : serviceAny.getAllInventory());

    inventoryObservable.subscribe({
      next: (response: any[]) => {
        this.inventoryList = response || [];

        // ইনভেন্টরি ডাটা রিলোড হলে প্রোডাক্ট ফিল্টার অটো-আপডেট হবে
        const currentWarehouseId = this.stockTransferForm.get('fromWarehouseId')?.value;
        if (currentWarehouseId) {
          this.filterProductsByWarehouse(currentWarehouseId);
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Inventory Load Error:', err);
      }
    });
  }

  // =========================================================
  // DIRECT STATUS CHANGE FROM TABLE (WITH INVENTORY UPDATE)
  // =========================================================
  onStatusChange(transfer: StockTransferResponseModel, event: Event | any): void {
    const target = event?.target as HTMLSelectElement;
    const newStatus: StockTransferStatus = target ? (target.value as StockTransferStatus) : event;

    if (!newStatus || newStatus === transfer.status) {
      return;
    }

    const previousStatus = transfer.status;
    transfer.status = newStatus;

    this.stockTransferService.getItemsByStockTransferId(transfer.id).subscribe({
      next: (itemsResponse) => {
        const itemRequests: StockTransferItemRequestModel[] = (itemsResponse || []).map((item) => ({
          stockTransferId: transfer.id,
          productId: Number(item.productId),
          quantity: Number(item.quantity)
        }));

        const request: StockTransferRequestModel = {
          fromWarehouseId: transfer.fromWarehouseId,
          toWarehouseId: transfer.toWarehouseId,
          status: newStatus,
          items: itemRequests
        };

        this.stockTransferService.updateStockTransfer(transfer.id, request).subscribe({
          next: () => {
            this.loadStockTransfers();
            this.loadInventoryData(); // স্ট্যাটাস পাল্টালে ইনভেন্টরি অটো রিফ্রেশ হবে
          },
          error: (err) => {
            console.error('Auto Status Update Error:', err);
            alert(err?.error?.message || 'Failed to auto-update status. Rolling back.');
            transfer.status = previousStatus;
            this.loadStockTransfers();
          }
        });
      },
      error: (err) => {
        console.error('Fetch items error on status change:', err);
        const fallbackRequest: StockTransferRequestModel = {
          fromWarehouseId: transfer.fromWarehouseId,
          toWarehouseId: transfer.toWarehouseId,
          status: newStatus,
          items: []
        };

        this.stockTransferService.updateStockTransfer(transfer.id, fallbackRequest).subscribe({
          next: () => {
            this.loadStockTransfers();
            this.loadInventoryData();
          },
          error: () => {
            alert('Failed to auto-update status.');
            transfer.status = previousStatus;
            this.loadStockTransfers();
          }
        });
      }
    });
  }

  // =========================================================
  // SAVE WITH INVENTORY QUANTITY UPDATE
  // =========================================================
  save(): void {
    if (this.stockTransferForm.invalid) {
      this.stockTransferForm.markAllAsTouched();
      alert('Please fill all required fields correctly.');
      return;
    }

    const formValue = this.stockTransferForm.value;
    const fromWarehouseId = Number(formValue.fromWarehouseId);
    const toWarehouseId = Number(formValue.toWarehouseId);

    if (fromWarehouseId === toWarehouseId) {
      alert('From Warehouse and To Warehouse cannot be the same.');
      return;
    }

    if (this.items.length === 0) {
      alert('Please add at least one product.');
      return;
    }

    // ইনভেন্টরি স্টক ভ্যালিডেশন: সিলেক্টেড কোয়ান্টিটি অ্যাভেইলেবল স্টকের বেশি কিনা
    for (const item of this.items.value) {
      const selectedProd = this.filteredProducts.find(p => Number(p.id) === Number(item.productId));
      if (selectedProd && Number(item.quantity) > selectedProd.availableQuantity) {
        alert(`Insufficient stock for product "${selectedProd.name}". Available: ${selectedProd.availableQuantity}, Requested: ${item.quantity}`);
        return;
      }
    }

    const request: StockTransferRequestModel = {
      fromWarehouseId,
      toWarehouseId,
      status: formValue.status,
      items: this.items.value.map((item: any) => ({
        stockTransferId: 0,
        productId: Number(item.productId),
        quantity: Number(item.quantity)
      }))
    };

    this.loading = true;

    if (this.editId !== null) {
      this.stockTransferService.updateStockTransfer(this.editId, request).subscribe({
        next: () => {
          alert('Stock Transfer Updated Successfully.');
          this.loading = false;
          this.loadStockTransfers();
          this.loadInventoryData();
          this.reset();
        },
        error: (err) => {
          this.loading = false;
          console.error('Update Error:', err);
          alert('Stock Transfer Update Failed.');
        }
      });
      return;
    }

    // নতুন ট্রান্সফার তৈরি
    this.stockTransferService.createStockTransfer(request).subscribe({
      next: (response: StockTransferResponseModel) => {
        const itemRequests: StockTransferItemRequestModel[] = this.items.value.map((item: any) => ({
          stockTransferId: response.id,
          productId: Number(item.productId),
          quantity: Number(item.quantity)
        }));

        this.createTransferItems(itemRequests, fromWarehouseId, toWarehouseId);
      },
      error: (err) => {
        this.loading = false;
        console.error('Stock Transfer Save Error:', err);
        alert('Stock Transfer Save Failed.');
      }
    });
  }

  private createTransferItems(
    itemRequests: StockTransferItemRequestModel[],
    fromWarehouseId: number,
    toWarehouseId: number
  ): void {
    let completed = 0;

    itemRequests.forEach((item) => {
      this.stockTransferService.createStockTransferItem(item).subscribe({
        next: () => {
          // ১. From Warehouse থেকে স্টক কমানো
          this.updateInventoryQuantity(fromWarehouseId, item.productId, -item.quantity);

          // ২. To Warehouse-এ স্টক বাড়ানো
          this.updateInventoryQuantity(toWarehouseId, item.productId, item.quantity);

          completed++;
          if (completed === itemRequests.length) {
            alert('Stock Transfer Completed Successfully! Inventory Updated.');
            this.loading = false;
            this.loadStockTransfers();
            this.loadInventoryData(); // রিয়েল-টাইম নতুন ইনভেন্টরি লোড
            this.reset();
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Transfer Item Save Error:', err);
          alert('Stock Transfer Item Save Failed.');
        }
      });
    });
  }

  // =========================================================
  // INVENTORY QUANTITY UPDATE METHOD
  // =========================================================
  private updateInventoryQuantity(warehouseId: number, productId: number, qtyChange: number): void {
    const invServiceAny = this.inventoryService as any;

    const targetInventory = this.inventoryList.find((inv: any) => {
      const wId = inv.warehouseId ?? inv.warehouse_id ?? inv.warehouse?.id;
      const pId = inv.productId ?? inv.product_id ?? inv.product?.id;
      return Number(wId) === Number(warehouseId) && Number(pId) === Number(productId);
    });

    if (targetInventory) {
      const currentQty = targetInventory.available ?? targetInventory.quantity ?? 0;
      const updatedInventory = {
        ...targetInventory,
        available: currentQty + qtyChange,
        quantity: currentQty + qtyChange
      };

      if (invServiceAny.update) {
        invServiceAny.update(targetInventory.id, updatedInventory).subscribe({
          error: (err: any) => console.error('Inventory update error:', err)
        });
      } else if (invServiceAny.updateInventory) {
        invServiceAny.updateInventory(targetInventory.id, updatedInventory).subscribe({
          error: (err: any) => console.error('Inventory update error:', err)
        });
      }
    }
  }

  // =========================================================
  // EDIT, DELETE & RESET
  // =========================================================
  edit(data: StockTransferResponseModel): void {
    this.editId = data.id;

    this.filterProductsByWarehouse(data.fromWarehouseId);

    this.stockTransferForm.patchValue({
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      status: data.status
    });

    this.items.clear();

    this.stockTransferService.getItemsByStockTransferId(data.id).subscribe({
      next: (response: StockTransferItemResponseModel[]) => {
        response.forEach((item) => {
          this.items.push(
            this.createItemFormGroup(String(item.productId), item.quantity)
          );
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Load Transfer Items Error:', err);
      }
    });
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this stock transfer?')) {
      return;
    }

    this.stockTransferService.deleteStockTransfer(id).subscribe({
      next: () => {
        alert('Stock Transfer Deleted Successfully.');
        this.loadStockTransfers();
        this.loadInventoryData();
      },
      error: (err) => {
        console.error('Delete Error:', err);
        alert('Stock Transfer Delete Failed.');
      }
    });
  }

  reset(): void {
    this.editId = null;
    this.filteredProducts = [];
    this.stockTransferForm.reset({
      fromWarehouseId: '',
      toWarehouseId: '',
      status: StockTransferStatus.PENDING
    });
    this.items.clear();
    this.error = null;
    this.cdr.detectChanges();
  }
}