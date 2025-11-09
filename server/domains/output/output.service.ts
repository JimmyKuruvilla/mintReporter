import { sortBy } from 'lodash-es';
import { IGNORE, NEW_LINE, UNCATEGORIZABLE } from '../../constants';
import { FileService } from '../file';
import { IReconciliation } from '../reconciliation';
import { SvcTransaction, TransactionService } from '../transaction';

const prepareTransactionCsv = (transactions: SvcTransaction[]) => {
  return transactions
    .map(_ => `${_.date.toLocaleDateString()}, ${_.description.replace(/ +/g, ' ')}, ${_.amount}, ${_.category}, ${_.accountName}`)
    .join(NEW_LINE);
};

const prepareSummaryCsv = (summary: IReconciliation) => {
  const ignoreTotal = summary[IGNORE];
  const uncategorizableTotal = summary[UNCATEGORIZABLE];
  const cleanList = Object.fromEntries(
    Object.entries(summary)
      .filter(([key, value]) => key !== IGNORE && key !== UNCATEGORIZABLE)
  );

  const csv = sortBy(Object.entries(cleanList), [([key, value]) => key])
    .concat([[IGNORE, ignoreTotal], [UNCATEGORIZABLE, uncategorizableTotal]])
    .map(([key, value]) => `${key}, ${parseFloat(value.toFixed(2))}`)
    .join(NEW_LINE);

  return csv;
};

export class OutputService {
  fileService!: FileService
  transactionService!: TransactionService
  constructor(data: { fileService: FileService, transactionService: TransactionService }) {
    Object.assign(this, data)
  }

  createFinalCSVs = async () => {
    const { debits, credits, reconciliation } = await this.transactionService.createReconciliation()

    const debitsCSV = prepareTransactionCsv(sortBy(debits, 'category'));
    const creditsCSV = prepareTransactionCsv(sortBy(credits, 'description'));
    const summaryCSV = prepareSummaryCsv(reconciliation);

    await this.fileService.write.outputDebits(debitsCSV);
    await this.fileService.write.outputCredits(creditsCSV);
    await this.fileService.write.outputSummary(summaryCSV);

    return { debitsCSV, creditsCSV, summaryCSV };
  };
}