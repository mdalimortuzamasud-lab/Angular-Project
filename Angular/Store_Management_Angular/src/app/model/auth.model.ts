export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  roleName: string;   // SUPER_ADMIN | ADMIN | MANAGER | STAFF | CASHIER
  branchId: number | null;  // null for SUPER_ADMIN - it's a global role
  branchName: string | null;
}

export interface RefreshRequest {
  refreshToken: string;
}