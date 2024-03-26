import { Transaction } from './transaction';

export enum ACCOUNTS {
  BANK = 'bank account',
  CREDIT = 'credit account',
}

export interface AccountDetails {
  name: string,
  parser: (accountName: string, csv: string) => Transaction[],
  type: ACCOUNTS
}
