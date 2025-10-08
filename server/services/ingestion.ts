import fs from 'fs';
import { chain } from 'lodash-es';
import { ChaseIdToDetails, uploadsFolder } from '../config';
import { IGNORE, UTF8, } from '../constants';
import { assignCategories, getCategoryBuckets } from './category';
import { getChaseAccountId } from './chase';
import { Write } from './data';
import { recursiveTraverse } from './file';
import { ICategorizedTransaction, ITransaction } from './transaction';
import { isNotTransfer, isUncategorizableOrCheck } from './utils';
import { TransactionType } from '../persistence/entity/transaction';

const getFields = (t: ICategorizedTransaction) => [
  `date: ${t.date}`,
  `description: ${t.description}`,
  `category: ${t.category}`,
  `amount: ${t.amount}`,
  `accountName: ${t.accountName}`,
  `chaseType: ${t.metadata.chaseType}`
]

const writeInitialData = (
  credits: ICategorizedTransaction[],
  debits: ICategorizedTransaction[],
) => {
  const uncategorizableDebits = debits.filter(isUncategorizableOrCheck)
  const ignoredDebits = debits.filter(i => i.category === IGNORE)

  console.log('############ WRITING ALL DATA ###################')
  Write.allCredits(credits)
  Write.allDebits(debits)

  console.log('############ KNOWN IGNORED DEBITS ###################')
  console.log(ignoredDebits.map(getFields))
  Write.ignoredDebits(ignoredDebits)

  console.log('############ UNCATEGORIZABLE DEBITS ###################')
  console.log(uncategorizableDebits.map(getFields))

  console.log('############ ALL CREDITS IGNORED / ARE CATEGORIZED AS IGNORE ###################')
}

export const createInitialData = async (startDate: Date, endDate: Date, fileExts: string[]) => {
  console.log(`Running reports from ${startDate} to ${endDate} using ${fileExts}`)

  const objWithinDateRange = (obj: { date: Date }) => obj.date >= startDate && obj.date <= endDate

  const allTransactions: ITransaction[] = []

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
    .sortBy('date')
    .map(assignCategories(buckets))
    .partition(['transactionType', TransactionType.DEBIT])
    .value()

  writeInitialData(credits, debits)
  return { credits, debits }
}
