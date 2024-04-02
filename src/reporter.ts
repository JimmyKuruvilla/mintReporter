#!/usr/bin env node
import fs from "fs";
import { sortBy, partition, uniq } from 'lodash';
import { COMMA, SUMMARY, TRANSACTION_TYPES, UTF8 } from './constants';
import { writeSummaryAsCsv, writeTransactionsAsCsv } from './csv';
import { combineSummaries, assignCategory, summarize, isNotTransfer, isNotIgnore } from './summary';
import { printDebugOutput } from './debug';
import { recursiveTraverse } from './utils';
import { getChaseAccountId } from './chase';
import { Transaction } from './transaction';

import { ChaseIdToDetails } from "./chaseIdtoDetails";

const START_DATE = process.env.START_DATE!
const END_DATE = process.env.END_DATE!
const FILE_EXTS = process.env.FILE_EXTS ? process.env.FILE_EXTS.split(COMMA) : ['.CSV']

if (!START_DATE ?? !END_DATE) {
  throw new Error('missing required config: start date, end date')
}

console.log(`Running reports using ${FILE_EXTS}`)
const createFinancialSummary = async (startDate: Date, endDate: Date) => {
  const objWithinDateRange = (obj: { date: Date }) => obj.date >= startDate && obj.date <= endDate


  const allTransactions: Transaction[] = []

  await recursiveTraverse('csvs/inputs', FILE_EXTS, console, (path: string) => {
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

  const [_debits, _credits] = partition(allTransactions, ['transactionType', TRANSACTION_TYPES.DEBIT])
  const debits = sortBy(_debits.filter(objWithinDateRange).filter(isNotTransfer).map(assignCategory).filter(isNotIgnore), 'date')
  const credits = sortBy(_credits.filter(objWithinDateRange).filter(isNotTransfer).map(assignCategory).filter(isNotIgnore), 'date')

  printDebugOutput(_debits, _credits, debits, credits)

  const combinedSummary = combineSummaries(summarize(debits), summarize(credits))

  writeTransactionsAsCsv(TRANSACTION_TYPES.DEBIT, debits)
  writeTransactionsAsCsv(TRANSACTION_TYPES.CREDIT, credits)
  writeSummaryAsCsv(SUMMARY, combinedSummary)
}

(async () => {
  await createFinancialSummary(new Date(START_DATE), new Date(END_DATE));
})()
