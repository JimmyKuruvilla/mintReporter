import { SvcTransactionCtorArgs } from './svc.transaction';

export type UiTransaction = Omit<SvcTransactionCtorArgs, 'date'> & {
  date: Date;
  checkNum?: number;
  bankType?: string;
  institutionTransactionType: string
};
