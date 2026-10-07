export interface CustomerRequestModel {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface CustomerResponseModel {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  dueAmount: number;
}