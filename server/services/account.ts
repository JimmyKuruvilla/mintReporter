import { AccountType } from '../persistence/transaction/transaction.entity';
import { ITransaction } from './transaction';

export interface AccountDetails {
  name: string,
  parser: (accountName: string, csv: string) => ITransaction[],
  type: AccountType
}
