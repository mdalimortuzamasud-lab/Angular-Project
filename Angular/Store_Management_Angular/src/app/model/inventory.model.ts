// Matches backend dto/request/InventoryRequestDto.java
export interface InventoryRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
  reservedQuantity: number;
}

// Matches backend dto/response/InventoryResponseDto.java
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
