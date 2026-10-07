// Matches backend dto/request/SaleItemRequestDto.java
export interface SaleItemRequest {
  saleId: number;
  productId: number;
  quantity: number;
  sellingPrice: number;
}

// Matches backend dto/response/SaleItemResponseDto.java
export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  productName: string;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
}

// UI-side helper for a row being edited in the batch-add grid, before
// it's saved to the backend.
export interface SaleItemDraft {
  productId: number | null;
  quantity: number | null;
  sellingPrice: number | null;
}
