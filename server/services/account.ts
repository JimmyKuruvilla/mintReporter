import { AccountType } from '../persistence/transaction/transaction.dao';
import { SvcTransaction } from './svcTransaction';

export interface AccountDetails {
  name: string,
  parser: (accountName: string, csv: string) => SvcTransaction[],
  type: AccountType
}
