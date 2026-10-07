// stock-transfer.model.ts
// =========================================================
// STOCK TRANSFER REQUEST
// =========================================================

export interface StockTransferRequestModel {

  fromWarehouseId: number;

  toWarehouseId: number;

  status: StockTransferStatus;

  items: StockTransferItemRequestModel[];
}



// =========================================================
// STOCK TRANSFER RESPONSE
// =========================================================

export interface StockTransferResponseModel {
  id: number;

  fromWarehouseId: number;
  fromWarehouseName: string;

  toWarehouseId: number;
  toWarehouseName: string;

  status: StockTransferStatus;

  createdAt: string;
}
// =========================================================
// STOCK TRANSFER STATUS
// =========================================================

export enum StockTransferStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED'
}

// =========================================================
// STOCK TRANSFER ITEM REQUEST
// =========================================================

export interface StockTransferItemRequestModel {
  stockTransferId: number;

  productId: number;

  quantity: number;
}


// =========================================================
// STOCK TRANSFER ITEM RESPONSE
// =========================================================

export interface StockTransferItemResponseModel {
  id: number;

  stockTransferId: number;

  productId: number;
  productName: string;

  quantity: number;
}


// =========================================================
// STOCK ADJUSTMENT REQUEST
// =========================================================

export interface StockAdjustmentRequestModel {
  productId: number;

  warehouseId: number;

  adjustmentType: StockAdjustmentType;

  quantity: number;

  reason: string;
}

// =========================================================
// STOCK ADJUSTMENT RESPONSE
// =========================================================

export interface StockAdjustmentResponseModel {
  id: number;

  productId: number;
  productName: string;

  warehouseId: number;
  warehouseName: string;

  adjustmentType: StockAdjustmentType;

  quantity: number;

  reason: string;

  createdAt: string;
}
// =========================================================
// STOCK ADJUSTMENT TYPE
// =========================================================

export enum StockAdjustmentType {
  ADD = 'ADD',
  REMOVE = 'REMOVE'
}
export interface Inventory {
  id: number;
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}
