

// =========================
// Sale Return Request
// =========================

export interface SaleReturnRequest {
  saleId: number;
  totalAmount: number;
}


// =========================
// Sale Return Response
// =========================

export interface SaleReturnResponse {
  id: number;
  saleId: number;
  totalAmount: number;
}


// =========================
// Sale Return Item Request
// =========================

export interface SaleReturnItemRequest {
  saleReturnId: number;
  productId: number;
  quantity: number;
}


// =========================
// Sale Return Item Response
// =========================

export interface SaleReturnItemResponse {
  id: number;
  saleReturnId: number;
  productId: number;
  productName: string;
  quantity: number;
}

export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  sellingPrice:Number
}
