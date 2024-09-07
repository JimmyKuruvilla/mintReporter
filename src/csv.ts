import fs from 'fs';
import { sortBy } from 'lodash';
import { NEW_LINE, csvOutputFilePath } from './constants';
import { CombinedSummary } from './summary';
import { Transaction } from './transaction';

export const writeSummaryAsCsv = (filename: string, summary: CombinedSummary) => {
  const output = sortBy(Object.entries(summary), [([key, value]) => key])
    .map(([key, value]) => `${key}, ${parseFloat(value.toFixed(2))}`)
    .join(NEW_LINE);

  fs.writeFileSync(csvOutputFilePath(filename), output)
}

export const writeTransactionsAsCsv = (filename: string, transactions: Transaction[]) => {
  const output = transactions
    .map(_ => `${_.date.toLocaleDateString()}, ${_.description.replace(/ +/g, ' ')}, ${_.amount}, ${_.category}, ${_.accountName}`)
    .join(NEW_LINE);

  fs.writeFileSync(csvOutputFilePath(filename), output)
}
