
import { chain } from 'lodash-es';
import { IGNORE } from '../constants';
import { Persistence } from '../persistence';
import { TransactionType } from '../persistence/transaction/transaction.dao';
import { getUmbrellaCategoryAcc, IUmbrellaCategoryAcc } from './category';
import { SvcTransaction } from './svcTransaction';

export type IUmbrellaCategoryAccWithTotal = IUmbrellaCategoryAcc & { total: number; };
export const summarizeTransactionCategories = (type: TransactionType, umbrellaCategoryAcc: IUmbrellaCategoryAcc, transactions: SvcTransaction[]): IUmbrellaCategoryAccWithTotal => {
  const summarizedTransactions = transactions.reduce((acc, t) => {
    const currentValue = acc[t.category] ?? 0;

    return { ...acc, ...({ [t.category]: currentValue + t.amount }) };
  }, umbrellaCategoryAcc);

  let total;

  if (type === TransactionType.DEBIT) {
    total = chain(summarizedTransactions).omit(IGNORE).reduce((acc, v) => acc + v, 0).value();
  } else {
    total = chain(summarizedTransactions).reduce((acc, v) => acc + v, 0).value();
  }
  return { ...summarizedTransactions, total };
};

export type IReconciledSummary = Omit<IUmbrellaCategoryAccWithTotal, 'total'> & { _TotalOutgoing: number; _totalIncoming: number; _Net: number; };
export const createReconciledSummary = (debitsSummary: IUmbrellaCategoryAccWithTotal, creditsSummary: IUmbrellaCategoryAccWithTotal) => {
  const mergedCategories: any = {};
  Object.entries(debitsSummary).forEach(([category, value]) => {
    mergedCategories[category] = debitsSummary[category] + creditsSummary[category];
  });

  mergedCategories['_TotalOutgoing'] = debitsSummary.total;
  mergedCategories['_TotalIncoming'] = creditsSummary.total;
  mergedCategories['_Net'] = mergedCategories.total;
  delete mergedCategories.total;
  return mergedCategories as IReconciledSummary;
};

// TODO: this also needs to take a date range
export const createSummary = async () => {
  const debits = await Persistence.transactions.debits.read()
  const credits = await Persistence.transactions.credits.read()
  const umbrellaCategoryAcc = await getUmbrellaCategoryAcc();
  const reconciledSummary = createReconciledSummary(
    summarizeTransactionCategories(TransactionType.DEBIT, umbrellaCategoryAcc, debits),
    summarizeTransactionCategories(TransactionType.CREDIT, umbrellaCategoryAcc, credits)
  );
//TODO reconciledSummary should be a class!
  return { debits, credits, reconciledSummary };
};

