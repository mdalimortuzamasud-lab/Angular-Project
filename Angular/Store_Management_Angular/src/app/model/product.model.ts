export interface ProductRequestModel {
  name: string;
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  unit: string;
  taxRate: number;
  categoryId: number;
  branchId: number;
}

export interface ProductResponseModel {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  unit: string;
  taxRate: number;
  categoryId: number;
  categoryName: string;
  branchId: number;
  branchName: string;
}