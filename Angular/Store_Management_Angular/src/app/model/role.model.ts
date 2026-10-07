// role.model.ts


// =========================================================
// ROLE REQUEST MODEL
// =========================================================

export interface RoleRequestModel {

  name: string;

}


// =========================================================
// ROLE RESPONSE MODEL
// =========================================================

export interface RoleResponseModel {

  id: number;

  name: string;

}


export enum RoleName {

  SUPER_ADMIN = 'SUPER_ADMIN',

  ADMIN = 'ADMIN',

  MANAGER = 'MANAGER',

  STAFF = 'STAFF',

  CASHIER = 'CASHIER'

}
