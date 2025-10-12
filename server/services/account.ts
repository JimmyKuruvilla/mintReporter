import { AccountType } from '../persistence/transaction/transaction.dao';
import { SvcTransaction } from './transaction.svc';

export interface AccountDetails {
  name: string,
  parser: (accountName: string, csv: string) => SvcTransaction[],
  type: AccountType
}
