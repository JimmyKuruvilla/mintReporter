import fs from 'fs';
import { IGNORE, UNCATEGORIZABLE, FILE_NAMES, CHECK, SUMMARY, TRANSACTION_TYPES, UTF8 } from '../constants'
import { initialDataFilePath, inputsFolder } from '../config'
import { CategorizedTransaction, hydrateCategorizedTransaction, Transaction } from './transaction'
import { isUncategorizable, readJsonFile, recursiveTraverse, updatePermanentQueries, writeSummaryAsCsv, writeTransactionsAsCsv } from './utils';
import { chain, sortBy } from 'lodash';
import { ChaseIdToDetails } from '../config';
import { getChaseAccountId } from './chase';
import { isNotTransfer, assignCategories, combineSummaries, summarize } from './summary';

const getFields = (t: CategorizedTransaction) => [
  `date: ${t.date}`,
  `description: ${t.description}`,
  `category: ${t.category}`,
  `permanentCategory: ${t.permanentCategory}`,
  `amount: ${t.amount}`,
  `accountName: ${t.accountName}`,
  `chaseType: ${t.metadata.chaseType}`
]

const writeInitialData = (debits: CategorizedTransaction[], credits: CategorizedTransaction[]) => {
  const uncategorizableDebits = debits.filter(isUncategorizable)
  const categorizableDebits = debits.filter(i => !isUncategorizable(i))
  const ignoredDebits = debits.filter(i => i.category === IGNORE)

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

  const allTransactions: Transaction[] = []

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

  const [allDebits, allCredits] = chain(allTransactions)
    .filter(t => objWithinDateRange(t) && isNotTransfer(t))
    .sortBy('date')
    .map(assignCategories)
    .partition(['transactionType', TRANSACTION_TYPES.DEBIT])
    .value()

  writeInitialData(allDebits, allCredits)
}

export const createFinalSummary = async () => {
  const allDebits = (await readJsonFile(initialDataFilePath(FILE_NAMES.ALL_DEBITS)))
    .map(hydrateCategorizedTransaction)
  const allCredits = (await readJsonFile(initialDataFilePath(FILE_NAMES.ALL_CREDITS)))
    .map(hydrateCategorizedTransaction)
  const uncategorizableDebits = (await readJsonFile(initialDataFilePath(FILE_NAMES.UNCATEGORIZABLE_DEBITS)))
    .map(hydrateCategorizedTransaction)
    .map(assignCategories)

  const categorizableDebits = allDebits.filter((t: CategorizedTransaction) => !isUncategorizable(t))
  const processedDebits = [...categorizableDebits, ...uncategorizableDebits]

  const combinedSummary = combineSummaries(
    summarize(processedDebits),
    summarize(allCredits)
  )

  writeTransactionsAsCsv(TRANSACTION_TYPES.DEBIT, sortBy(processedDebits, 'category'))
  writeTransactionsAsCsv(TRANSACTION_TYPES.CREDIT, sortBy(allCredits, 'description'))
  writeSummaryAsCsv(SUMMARY, combinedSummary)

  await updatePermanentQueries(uncategorizableDebits)

  console.log('############ REMAINING UNCATEGORIZABLE DEBITS/CHECKS ###################')
  console.log(processedDebits.filter(isUncategorizable))
}