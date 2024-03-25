import fs from 'fs';
import { sortBy } from 'lodash';
import { NEW_LINE, outputFilePath } from './constants';
import { CombinedSummary } from './summary';

export interface Transaction {
  date: Date,
  description: string,
  originalDescription: string,
  amount: number,
  transactionType: string,
  category: string,
  accountName: string,
  labels: string,
  notes: string
}

export const csvToTransactions = (csv: string): Transaction[] => {
  const [headers, ...lines] = csv.split(NEW_LINE);
  return lines
    .filter(Boolean)
    .map(line => {
      const [date, description, originalDescription, amount, transactionType, category, accountName, labels, notes] = line
        .split(/","/g)
        .map(_ => _.replace(/"/g, ''));

      return {
        date: new Date(date),
        description,
        originalDescription,
        amount: parseFloat(amount),
        transactionType,
        category,
        accountName,
        labels,
        notes
      }
    })
}


export const writeSummaryAsCsv = (filename: string, summary: CombinedSummary) => {
  const output = sortBy(Object.entries(summary), [([key, value]) => key])
    .map(([key, value]) => `${key}, ${parseFloat(value.toFixed(2))}`)
    .join(NEW_LINE);

  fs.writeFileSync(outputFilePath(filename), output)
}

export const writeTransactionsAsCsv = (filename: string, transactions: Transaction[]) => {
  const output = transactions
    .map(_ => `${_.date.toLocaleDateString()}, ${_.originalDescription.replace(/,/g, '')}, ${_.amount}, ${_.category.replace(/,/g, '')}, ${_.accountName.replace(/,/g, '')}`)
    .join(NEW_LINE);

  fs.writeFileSync(outputFilePath(filename), output)
}
