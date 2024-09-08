#!/usr/bin env node
import fs from "fs";
import { chain } from 'lodash';
import { COMMA, SUMMARY, TRANSACTION_TYPES, UNCATEGORIZABLE, UTF8 } from './constants';
import { combineSummaries, assignCategories, summarize, isNotTransfer, isNotIgnore } from './summary';
import { writeInitialData } from './writeInitialData';
import { clearInitialData, readJsonFile, recursiveTraverse, writeSummaryAsCsv, writeTransactionsAsCsv } from './utils';
import { getChaseAccountId } from './chase';
import { CategorizedTransaction, CategorizedTransactionJson, Transaction, hydrateCategorizedTransaction } from './transaction';

import { ChaseIdToDetails } from "./chaseIdtoDetails";

const STAGE = process.env.STAGE!

const createInitialData = async (startDate: Date, endDate: Date) => {
  const START_DATE = process.env.START_DATE!
  const END_DATE = process.env.END_DATE!
  const FILE_EXTS = process.env.FILE_EXTS ? process.env.FILE_EXTS.split(COMMA) : ['.CSV']

  if (!START_DATE ?? !END_DATE) {
    throw new Error('missing required config: start date, end date')
  }
  console.log(`Running reports using ${FILE_EXTS}`)


  const objWithinDateRange = (obj: { date: Date }) => obj.date >= startDate && obj.date <= endDate

  const allTransactions: Transaction[] = []

  await recursiveTraverse('data/inputs', FILE_EXTS, console, (path: string) => {
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

const createFinalSummary = async () => {
  const allDebits = (await readJsonFile('./data/initial/debits.all.json'))
    .map(hydrateCategorizedTransaction)
  const allCredits = (await readJsonFile('./data/initial/credits.all.json'))
    .map(hydrateCategorizedTransaction)
  const uncategorizableDebits = (await readJsonFile('./data/initial/debits.uncategorizable.json'))
    .map(hydrateCategorizedTransaction)
    .map(assignCategories)

  const debitsWithoutUncategorizable = allDebits.filter((t: CategorizedTransaction) => t.category !== UNCATEGORIZABLE)
  const processedDebits = [...debitsWithoutUncategorizable, ...uncategorizableDebits]

  const combinedSummary = combineSummaries(
    summarize(processedDebits),
    summarize(allCredits)
  )

  writeTransactionsAsCsv(TRANSACTION_TYPES.DEBIT, processedDebits)
  writeTransactionsAsCsv(TRANSACTION_TYPES.CREDIT, allCredits)
  writeSummaryAsCsv(SUMMARY, combinedSummary)
}

(async () => {
  switch (STAGE) {
    case 'writeInitialData':
      const START_DATE = process.env.START_DATE!
      const END_DATE = process.env.END_DATE!
      const FILE_EXTS = process.env.FILE_EXTS ? process.env.FILE_EXTS.split(COMMA) : ['.CSV']

      if (!START_DATE ?? !END_DATE) {
        throw new Error('missing required config: start date, end date')
      }
      console.log(`Running reports using ${FILE_EXTS}`)

      await clearInitialData()
      await createInitialData(new Date(START_DATE), new Date(END_DATE));
      break;
    case 'writeFinalSummary':
      await createFinalSummary()
      break;
    default:
      console.log('NO STAGE PROVIDED')
      return
  }
})()
