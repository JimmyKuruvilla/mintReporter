import fs from 'fs';
import { chain } from 'lodash-es';
import { ChaseIdToDetails, uploadsFolder } from '../config';
import { UTF8 } from '../constants';
import { Persistence } from '../persistence';
import { db } from '../persistence/db';
import { CategorizedTransaction, TransactionType } from '../persistence/transaction/transaction.entity';
import { assignCategories, getCategoryBuckets } from './category';
import { getChaseAccountId } from './chase';
import { recursiveTraverse } from './file';
import { ITransactionDTO } from './transaction';
import { isNotTransfer } from './utils';

export const createInitialData = async (startDate: Date, endDate: Date, fileExts: string[]) => {
  console.log(`Running reports from ${startDate} to ${endDate} using ${fileExts}`)

  const objWithinDateRange = (obj: { date: Date }) => obj.date >= startDate && obj.date <= endDate

  const allTransactions: ITransactionDTO[] = []

  await recursiveTraverse(uploadsFolder, fileExts, console, (path: string) => {
    const id = getChaseAccountId(path)
    if (id) {
      const csvTransactions = fs.readFileSync(path, { encoding: UTF8 });
      const account = ChaseIdToDetails[id]

      console.log(`Processing ${path}`)
      const transactions = account.parser(account.name, csvTransactions)

      allTransactions.push(...transactions)
    } else {
      throw new Error(`Files without id found: ${path}`)
    }
  })

  const buckets = await getCategoryBuckets()
  const [debits, credits] = chain(allTransactions)
    .filter(t => objWithinDateRange(t) && isNotTransfer(t))
    .map(assignCategories(buckets))
    .partition(['transactionType', TransactionType.DEBIT])
    .value()

  await db.transaction(async (trxManager) => {
    await Persistence.transactions.credits.write(credits.map(t => new CategorizedTransaction(t)), trxManager)
    await Persistence.transactions.debits.write(debits.map(t => new CategorizedTransaction(t)), trxManager)
  })
}
