export interface Bank {
  name: string;
  code: string;
}

export interface Account {
  account_number: string;
  balance: number;
  bank_name: string;
  owner_name?: string; // 옵션
}

export interface Transaction {
  id: number;
  from_account: string;
  to_account: string;
  amount: number;
  timestamp: string;
  from_bank_name: string;
  to_bank_name: string;
}