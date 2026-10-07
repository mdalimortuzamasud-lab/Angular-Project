// Matches backend dto/request/PurchaseItemRequestDto.java
export interface PurchaseItemRequest {
  purchaseId: number;
  productId: number;
  quantity: number;
  costPrice: number;
}

// Matches backend dto/response/PurchaseItemResponseDto.java
export interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  productName: string;
  quantity: number;
  costPrice: number;
}

// Convenience type for a row being edited in the "add items" grid,
// before it's saved to the backend. Kept in the same file since it's
// purely a UI-side helper for the purchase item form.
export interface PurchaseItemDraft {
  productId: number | null;
  quantity: number | null;
  costPrice: number | null;
}
