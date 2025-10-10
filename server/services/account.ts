import { AccountType } from '../persistence/transaction/transaction.entity';
import { ITransactionDTO } from './transaction';

export interface AccountDetails {
  name: string,
  parser: (accountName: string, csv: string) => ITransactionDTO[],
  type: AccountType
}
