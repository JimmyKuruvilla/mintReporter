import { Transaction } from './transaction';

export enum ACCOUNTS {
  BANK = 'bank_account',
  CREDIT = 'credit_card_account',
}

export interface AccountDetails {
  name: string,
  parser: (accountName: string, csv: string) => Transaction[],
  type: ACCOUNTS
}
