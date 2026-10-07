// Matches backend enums/InventoryTransactionType.java
export enum InventoryTransactionType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
  TRANSFER = 'TRANSFER'
}

// Matches backend dto/response/InventoryTransactionResponseDto.java
export interface InventoryTransaction {
  id: number;
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  type: InventoryTransactionType;
  quantity: number;
  referenceId: number | null;
  createdAt: string; // ISO datetime string from LocalDateTime
}
