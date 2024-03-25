#!/usr/bin env node
import fs from "fs";
import { sortBy, partition } from 'lodash';
import { CATEGORY, CREDIT, DEBIT, SUMMARY, UTF8 } from './constants';
import { csvToTransactions, writeSummaryAsCsv, writeTransactionsAsCsv } from './csv';
import { combineSummaries, rewriteCategories, summarize } from './summary';
import { printDebugOutput } from './debug';

const TRANSACTIONS_FILE = process.env.TRANSACTIONS_FILE!
const START_DATE = process.env.START_DATE!
const END_DATE = process.env.END_DATE!

if (!TRANSACTIONS_FILE ?? !START_DATE ?? !END_DATE) {
  throw new Error('missing required config: input file, start date, end date')
}

const createFinancialSummary = (startDate: Date, endDate: Date) => {
  const objWithinDateRange = (obj: { date: Date }) => obj.date >= startDate && obj.date <= endDate

  const csvTransactions = fs.readFileSync(TRANSACTIONS_FILE, { encoding: UTF8 });

  const transactionsWithoutTransfers = csvToTransactions(csvTransactions)
    .filter(
      transaction =>
        transaction.category !== 'Credit Card Payment' &&
        transaction.category !== 'College Savings' &&
        transaction.category !== 'Transfer' &&
        !(transaction.category === 'Financial' && transaction.description === 'Vanguard')
    );

  const [_debits, _credits] = partition(transactionsWithoutTransfers, ['transactionType', DEBIT])
  const negativeDebits = _debits.map(d => ({ ...d, amount: -d.amount }))

  const { notIgnored: debits, unchangedCategories: unchangedDebitCategories, ignored: ignoredDebits } = rewriteCategories(sortBy(negativeDebits, CATEGORY).filter(objWithinDateRange))

  const { notIgnored: credits, unchangedCategories: unchangedCreditCategories, ignored: ignoredCredits } = rewriteCategories(sortBy(_credits, CATEGORY).filter(objWithinDateRange))

  printDebugOutput(ignoredCredits, ignoredDebits, unchangedCreditCategories, unchangedDebitCategories)
  const combinedSummary = combineSummaries(summarize(debits), summarize(credits))

  writeTransactionsAsCsv(DEBIT, debits)
  writeTransactionsAsCsv(CREDIT, credits)
  writeSummaryAsCsv(SUMMARY, combinedSummary)
}

createFinancialSummary(new Date(START_DATE), new Date(END_DATE));
