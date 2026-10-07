// =========================
// Payment Method
// =========================

export type PaymentMethod =
  | 'CASH'
  | 'CARD'
  | 'BANK'
  | 'MOBILE_BANKING';


// =========================
// Supplier Payment Request
// =========================

export interface SupplierPaymentRequestModel {
  supplierId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
}


// =========================
// Supplier Payment Response
// =========================

export interface SupplierPaymentResponseModel {
  id: number;
  supplierId: number;
  supplierName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
}

// Matches backend enums/PurchaseStatus.java
export enum PurchaseStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
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

