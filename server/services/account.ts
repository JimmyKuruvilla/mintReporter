import { ITransaction } from './transaction';

export enum Accounts {
  BANK = 'bank_account',
  CREDIT = 'credit_card_account',
}

export interface AccountDetails {
  name: string,
  parser: (accountName: string, csv: string) => ITransaction[],
  type: Accounts
}
