export interface Branch {
  id?: number;
  name: string;
  location: string;
}

export interface BranchRequest {
  name: string;
  location: string;
}

export interface BranchResponse {
  id: number;
  name: string;
  location: string;
}

