import { sortBy } from 'lodash-es';
import { IGNORE, NEW_LINE, UNCATEGORIZABLE } from '../constants';
import { Write } from './file';
import { createSummary, IReconciledSummary } from './summary';
import { SvcTransaction } from './transaction.svc';

export const prepareTransactionCsv = (transactions: SvcTransaction[]) => {
  return transactions
    .map(_ => `${_.date.toLocaleDateString()}, ${_.description.replace(/ +/g, ' ')}, ${_.amount}, ${_.category}, ${_.accountName}`)
    .join(NEW_LINE);
};

export const prepareSummaryCsv = (summary: IReconciledSummary) => {
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

export const createFinalCSVs = async () => {
  const { debits, credits, reconciledSummary } = await createSummary();
  const debitsCSV = prepareTransactionCsv(sortBy(debits, 'category'));
  const creditsCSV = prepareTransactionCsv(sortBy(credits, 'description'));
  const summaryCSV = prepareSummaryCsv(reconciledSummary);

  await Write.outputDebits(debitsCSV);
  await Write.outputCredits(creditsCSV);
  await Write.outputSummary(summaryCSV);

  console.log('############ REMAINING UNCATEGORIZABLE DEBITS/CHECKS ###################');
  console.log(debits.filter(d => d.isUncategorizableOrCheck()));

  return { debitsCSV, creditsCSV, summaryCSV };
};
