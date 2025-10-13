
import { chain } from 'lodash-es';
import { IGNORE } from '../../constants';
import { CategoryService, ICategoryAcc } from '../category';
import { SvcTransaction } from '../transaction';
import { TransactionType } from '../transaction/transactionType';
const categoryService = new CategoryService()

export type ICategoryAccWithTotal = ICategoryAcc & { total: number; };
const reconcileTransactionCategories = (type: TransactionType, umbrellaCategoryAcc: ICategoryAcc, transactions: SvcTransaction[]): ICategoryAccWithTotal => {
  const reconciledTransactions = transactions.reduce((acc, t) => {
    const currentValue = acc[t.category] ?? 0;

    return { ...acc, ...({ [t.category]: currentValue + t.amount }) };
  }, umbrellaCategoryAcc);

  let total;

  if (type === TransactionType.DEBIT) {
    total = chain(reconciledTransactions).omit(IGNORE).reduce((acc, v) => acc + v, 0).value();
  } else {
    total = chain(reconciledTransactions).reduce((acc, v) => acc + v, 0).value();
  }
  return { ...reconciledTransactions, total };
};

type IReconciliationAdditionalFields = { _TotalOutgoing: number; _TotalIncoming: number; _Net: number; }
export type IReconciliation = Omit<ICategoryAccWithTotal, 'total'> & IReconciliationAdditionalFields;
const createReconciliation = (debitsSummary: ICategoryAccWithTotal, creditsSummary: ICategoryAccWithTotal) => {
  const reconciliation: IReconciliation = { _TotalOutgoing: 0, _TotalIncoming: 0, _Net: 0 };
  Object.entries(debitsSummary).forEach(([category, value]) => {
    reconciliation[category] = debitsSummary[category] + creditsSummary[category];
  });

  reconciliation._TotalOutgoing = debitsSummary.total;
  reconciliation._TotalIncoming = creditsSummary.total;
  reconciliation._Net = reconciliation.total;
  delete reconciliation.total;
  return reconciliation
};

export class SvcReconciliation {
  debits!: SvcTransaction[]
  credits!: SvcTransaction[]
  reconciliation!: IReconciliation

  constructor(data: {
    debits: SvcTransaction[],
    credits: SvcTransaction[]
  }) {
    Object.assign(this, data)
  }

  // TODO: this also needs to take a date range
  calc = async () => {
    const categoryAcc = await categoryService.getCategoryAcc();
    this.reconciliation = createReconciliation(
      reconcileTransactionCategories(TransactionType.DEBIT, categoryAcc, this.debits),
      reconcileTransactionCategories(TransactionType.CREDIT, categoryAcc, this.credits)
    );

    return this
  }
}