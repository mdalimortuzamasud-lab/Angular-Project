export interface WarehouseRequest {
  name: string;
  branchId: number;
}

export interface WarehouseResponse {
  id: number;
  name: string;
  branchId: number;
  branchName: string; // if your backend returns it
}