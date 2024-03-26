#!/usr/bin env node
import fs from "fs";
import { sortBy, partition, uniq } from 'lodash';
import { CATEGORY, CREDIT, DEBIT, SUMMARY, UTF8 } from './constants';
import { writeSummaryAsCsv, writeTransactionsAsCsv } from './csv';
import { combineSummaries, rewriteCategories, summarize } from './summary';
import { printDebugOutput } from './debug';
import { recursiveTraverse } from './utils';
import { ChaseIdToDetails, getChaseAccountId } from './chase';
import { Transaction } from './transaction';


const TRANSACTIONS_FILE = process.env.TRANSACTIONS_FILE!
const START_DATE = process.env.START_DATE!
const END_DATE = process.env.END_DATE!

if (!TRANSACTIONS_FILE ?? !START_DATE ?? !END_DATE) {
  throw new Error('missing required config: input file, start date, end date')
}

const createFinancialSummary = async (startDate: Date, endDate: Date) => {
  const objWithinDateRange = (obj: { date: Date }) => obj.date >= startDate && obj.date <= endDate


  const allTransactions: Transaction[] = []

  await recursiveTraverse('csvs/inputs', ['.CSV'], console, (path: string) => {
    const id = getChaseAccountId(path)
    if (id) {
      const csvTransactions = fs.readFileSync(path, { encoding: UTF8 });
      const account = ChaseIdToDetails[id]
      console.log(`Processing ${path}`)
      const transactions = account.parser(account.name, csvTransactions)

      allTransactions.push(...transactions)
      // -- need to exclude transfers for each type of account. include in IGNORE
      // check jan data both ways

    } else {
      throw new Error(`Files without id found: ${path}`)
    }
  })

  const [_debits, _credits] = partition(allTransactions, ['transactionType', DEBIT])

  const { notIgnored: debits, unmappable: unmappableDebitCategories, ignored: ignoredDebits } = rewriteCategories(_debits.filter(objWithinDateRange))

  const { notIgnored: credits, unmappable: unmappableCreditCategories, ignored: ignoredCredits } = rewriteCategories(_credits.filter(objWithinDateRange))

  printDebugOutput(ignoredCredits, ignoredDebits, unmappableCreditCategories, unmappableDebitCategories)
  const combinedSummary = combineSummaries(summarize(debits), summarize(credits))

  writeTransactionsAsCsv('new'+DEBIT, debits)
  writeTransactionsAsCsv('new'+CREDIT, credits)
  writeSummaryAsCsv('new'+SUMMARY, combinedSummary)
}

(async () => {
  await createFinancialSummary(new Date(START_DATE), new Date(END_DATE));
})()
