import { AccountType } from '../persistence/entity/transaction';
import { ITransaction } from './transaction';

export interface AccountDetails {
  name: string,
  parser: (accountName: string, csv: string) => ITransaction[],
  type: AccountType
}
