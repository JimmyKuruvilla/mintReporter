
import { chain } from 'lodash-es';
import { IGNORE } from '../constants';
import { assignCategories, getCategoryBuckets, getUmbrellaCategoryAcc, IUmbrellaCategoryAcc } from './category';
import { Read } from './data';
import { CategorizedTransaction, ICategorizedTransaction } from './transaction';
import { TransactionType } from '../persistence/entity/transaction';

export type IUmbrellaCategoryAccWithTotal = IUmbrellaCategoryAcc & { total: number; };
export const summarizeTransactionCategories = (type: TransactionType, umbrellaCategoryAcc: IUmbrellaCategoryAcc, transactions: ICategorizedTransaction[]): IUmbrellaCategoryAccWithTotal => {
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

export const createSummary = async () => {
  const buckets = await getCategoryBuckets();
  const debits = (await Read.allDebits()).map(CategorizedTransaction).map(assignCategories(buckets));
  const credits = (await Read.allCredits()).map(CategorizedTransaction).map(assignCategories(buckets));

  const umbrellaCategoryAcc = await getUmbrellaCategoryAcc();
  const reconciledSummary = createReconciledSummary(
    summarizeTransactionCategories(TransactionType.DEBIT, umbrellaCategoryAcc, debits),
    summarizeTransactionCategories(TransactionType.CREDIT, umbrellaCategoryAcc, credits)
  );

  return { debits, credits, reconciledSummary };
};

