import fs from 'fs';
import { IGNORE, UNCATEGORIZABLE,  CHECK, SUMMARY, TRANSACTION_TYPES, UTF8 } from '../constants'
import {  initialDataFilePath, inputsFolder, FILE_NAMES } from '../config'
import { CategorizedTransaction, ICategorizedTransaction, ITransaction } from './transaction'
import { isUncategorizable, recursiveTraverse, updatePermanentQueries, writeSummaryAsCsv, writeTransactionsAsCsv } from './utils';
import { chain, sortBy } from 'lodash';
import { ChaseIdToDetails } from '../config';
import { getChaseAccountId } from './chase';
import { isNotTransfer, assignCategories, combineSummaries, summarize } from './summary';
import { Read } from './data';

const getFields = (t: ICategorizedTransaction) => [
  `date: ${t.date}`,
  `description: ${t.description}`,
  `category: ${t.category}`,
  `permanentCategory: ${t.permanentCategory}`,
  `amount: ${t.amount}`,
  `accountName: ${t.accountName}`,
  `chaseType: ${t.metadata.chaseType}`
]

const writeInitialData = (
  credits: ICategorizedTransaction[],
  categorizableDebits: ICategorizedTransaction[],
  uncategorizableDebits: ICategorizedTransaction[],
  ignoredDebits: ICategorizedTransaction[]) => {

  console.log('############ WRITING ALL DATA ###################')
  fs.writeFileSync(initialDataFilePath(FILE_NAMES.ALL_CREDITS), JSON.stringify(credits, null, 2))
  fs.writeFileSync(initialDataFilePath(FILE_NAMES.ALL_DEBITS), JSON.stringify(categorizableDebits, null, 2))

  console.log('############ KNOWN IGNORED DEBITS ###################')
  console.log(ignoredDebits.map(getFields))
  fs.writeFileSync(initialDataFilePath(FILE_NAMES.IGNORED_DEBITS), JSON.stringify(ignoredDebits, null, 2))

  console.log('############ UNCATEGORIZABLE DEBITS ###################')
  console.log(uncategorizableDebits.map(getFields))
  fs.writeFileSync(initialDataFilePath(FILE_NAMES.UNCATEGORIZABLE_DEBITS), JSON.stringify(uncategorizableDebits, null, 2))

  console.log('############ ALL CREDITS IGNORED / ARE CATEGORIZED AS IGNORE ###################')
}

export const createInitialData = async (startDate: Date, endDate: Date, fileExts: string[]) => {
  console.log(`Running reports from ${startDate} to ${endDate} using ${fileExts}`)

  const objWithinDateRange = (obj: { date: Date }) => obj.date >= startDate && obj.date <= endDate

  const allTransactions: ITransaction[] = []

  await recursiveTraverse(inputsFolder, fileExts, console, (path: string) => {
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

  const [debits, credits] = chain(allTransactions)
    .filter(t => objWithinDateRange(t) && isNotTransfer(t))
    .sortBy('date')
    .map(assignCategories)
    .partition(['transactionType', TRANSACTION_TYPES.DEBIT])
    .value()

  const uncategorizableDebits = debits.filter(isUncategorizable)
  const categorizableDebits = debits.filter(i => !isUncategorizable(i))
  const ignoredDebits = debits.filter(i => i.category === IGNORE)

  writeInitialData(credits, categorizableDebits, uncategorizableDebits, ignoredDebits)
  return { credits, categorizableDebits, uncategorizableDebits, ignoredDebits }
}

export const createFinalSummary = async () => {
  const debits = (await Read.allDebits()).map(CategorizedTransaction)
  const credits = (await Read.allCredits()).map(CategorizedTransaction)
  const uncategorizableDebits = (await Read.uncategorizableDebits())
    .map(CategorizedTransaction)
    .map(assignCategories)

  const categorizableDebits = debits.filter((t) => !isUncategorizable(t))
  const processedDebits = [...categorizableDebits, ...uncategorizableDebits]

  const combinedSummary = combineSummaries(
    summarize(processedDebits),
    summarize(credits)
  )

  writeTransactionsAsCsv(TRANSACTION_TYPES.DEBIT, sortBy(processedDebits, 'category'))
  writeTransactionsAsCsv(TRANSACTION_TYPES.CREDIT, sortBy(credits, 'description'))
  writeSummaryAsCsv(SUMMARY, combinedSummary)

  await updatePermanentQueries(uncategorizableDebits)

  console.log('############ REMAINING UNCATEGORIZABLE DEBITS/CHECKS ###################')
  console.log(processedDebits.filter(isUncategorizable))
}