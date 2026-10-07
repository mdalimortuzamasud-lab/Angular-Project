export interface Dashboard {
  id: number;
  totalSalesToday: number;
  totalSalesThisMonth: number;
  totalPurchasesToday: number;
  totalPurchasesThisMonth: number;
  totalProfitToday: number;
  totalProfitThisMonth: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalProducts: number;
  totalCategories: number;
  totalBranches: number;
  totalWarehouses: number;
  totalStockValue: number;
  totalDueAmount: number;
  lowStockProductCount: number;
  outOfStockProductCount: number;
  lastCalculatedAt: string;
  branchId: number;
  branchName: string;
  generatedByUserId: number;
  generatedByUserName: string;
}