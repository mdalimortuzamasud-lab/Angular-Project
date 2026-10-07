// customer-payment.model.ts



// =========================
// Customer Payment Request
// =========================

export interface CustomerPaymentRequestModel {
  customerId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
}


// =========================
// Customer Payment Response
// =========================

export interface CustomerPaymentResponseModel {
  id: number;
  customerId: number;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
}
// =========================
// Payment Method
// =========================

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK = 'BANK',
  MOBILE_BANKING = 'MOBILE_BANKING'
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
// Matches backend enums/SaleStatus.java
export enum SaleStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}
