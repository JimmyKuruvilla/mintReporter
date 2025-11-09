
import { AccountType } from '../transaction/accountType';
import { SvcTransaction } from '../transaction/svc.transaction';

export interface AccountDetails {
  name: string,
  parser: (accountName: string, csv: string) => SvcTransaction[],
  type: AccountType
}
