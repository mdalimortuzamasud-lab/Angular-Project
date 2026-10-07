// Matches backend enums/SaleStatus.java
export enum SaleStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

// Matches backend dto/request/SaleRequestDto.java
export interface SaleRequest {
  customerId: number;
  warehouseId: number;
  totalAmount: number;
  paidAmount: number;
  status: SaleStatus;
}

// Matches backend dto/response/SaleResponseDto.java
export interface Sale {
  id: number;
  customerId: number;
  customerName: string;
  warehouseId: number;
  warehouseName: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: SaleStatus;
}
