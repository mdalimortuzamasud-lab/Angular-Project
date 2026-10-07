// user.model.ts

// =========================================================
// USER STATUS
// =========================================================

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}


// =========================================================
// USER REQUEST MODEL
// =========================================================

export interface UserRequestModel {

  username: string;

  email: string;

  password: string;

  status: UserStatus;

  roleId: number;

  branchId?: number;
}

// =========================================================
// USER RESPONSE MODEL
// =========================================================

export interface UserResponseModel {

  id: number;

  username: string;

  email: string;

  status: UserStatus;

  roleId: number;

  roleName: string;

  branchId?: number;

  branchName?: string;
}


export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  CASHIER = 'CASHIER'
}