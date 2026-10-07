export interface PurchaseReturnRequest {
  purchaseId: number;
  totalAmount: number;
}
export interface PurchaseReturnResponse {
  id: number;
  purchaseId: number;
  totalAmount: number;
}
export interface PurchaseReturnItemRequest {
  purchaseReturnId: number;
  productId: number;
  quantity: number;
}
export interface PurchaseReturnItemResponse {
  id: number;
  purchaseReturnId: number;
  productId: number;
  productName: string;
  quantity: number;
}

export interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  costPrice: number;
}