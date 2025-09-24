import fs from 'fs';
import { IGNORE, TRANSACTION_TYPES, UTF8, } from '../constants'
import { uploadsFolder } from '../config'
import { CategorizedTransaction, ICategorizedTransaction, ITransaction } from './transaction'
import { isUncategorizable, isUncategorizableOrCheck, prepareSummaryCsv, prepareTransactionCsv, recursiveTraverse, updatePermanentQueries } from './utils';
import { chain, sortBy } from 'lodash';
import { ChaseIdToDetails } from '../config';
import { getChaseAccountId } from './chase';
import { isNotTransfer, assignCategories, combineSummaries, summarize, getBuckets, getUmbrellaCategoryAcc } from './summary';
import { Read, Write } from './data';

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
  Write.uncategorizableDebits(uncategorizableDebits)

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

  const buckets = await getBuckets()
  const [debits, credits] = chain(allTransactions)
    .filter(t => objWithinDateRange(t) && isNotTransfer(t))
    .sortBy('date')
    .map(assignCategories(buckets))
    .partition(['transactionType', TRANSACTION_TYPES.DEBIT])
    .value()

  writeInitialData(credits, debits)
  return { credits, debits }
}

/*
  maybeCategorizableDebits
  is only used in the script format. In the UI debits and credits are edited directly and so this is always set to []
 */
export const getReconciledSummary = async ({ changedDebits }: { changedDebits: ICategorizedTransaction[] }) => {
  const debits = (await Read.allDebits()).map(CategorizedTransaction)
  const credits = (await Read.allCredits()).map(CategorizedTransaction)
  const buckets = await getBuckets()
  const maybeCategorizableDebits = changedDebits
    .map(CategorizedTransaction)
    .map(assignCategories(buckets))

  const categorizableDebits = debits.filter((t) => !isUncategorizable(t))
  const processedDebits = [...categorizableDebits, ...maybeCategorizableDebits]

  const umbrellaCategoryAcc = await getUmbrellaCategoryAcc()
  const reconciledSummary = combineSummaries(
    await summarize(umbrellaCategoryAcc, processedDebits),
    await summarize(umbrellaCategoryAcc, credits)
  )

  return { debits: processedDebits, credits, reconciledSummary, maybeCategorizableDebits }
}

export const createFinalSummaryCSVs = async ({ changedDebits }: { changedDebits: ICategorizedTransaction[] }) => {
  const { debits, credits, reconciledSummary, maybeCategorizableDebits } = await getReconciledSummary({ changedDebits })
  const debitsCSV = prepareTransactionCsv(sortBy(debits, 'category'))
  const creditsCSV = prepareTransactionCsv(sortBy(credits, 'description'))
  const summaryCSV = prepareSummaryCsv(reconciledSummary)

  await Write.outputDebits(debitsCSV)
  await Write.outputCredits(creditsCSV)
  await Write.outputSummary(summaryCSV)
  await updatePermanentQueries(maybeCategorizableDebits)

  console.log('############ REMAINING UNCATEGORIZABLE DEBITS/CHECKS ###################')
  console.log(debits.filter(isUncategorizableOrCheck))

  return { debitsCSV, creditsCSV, summaryCSV }
}