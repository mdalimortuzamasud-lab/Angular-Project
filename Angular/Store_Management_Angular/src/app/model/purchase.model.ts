// Matches backend enums/PurchaseStatus.java
export enum PurchaseStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

// Matches backend dto/request/PurchaseRequestDto.java
export interface PurchaseRequest {
  supplierId: number;
  warehouseId: number;
  totalAmount: number;
  paidAmount: number;
}

// Matches backend dto/response/PurchaseResponseDto.java
export interface Purchase {
  id: number;
  supplierId: number;
  supplierName: string;
  warehouseId: number;
  warehouseName: string;
  totalAmount: number;
  paidAmount: number;
  status: PurchaseStatus;
}
