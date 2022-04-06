#!/usr/bin env node
const fs = require("fs");
const { sortBy, partition } = require('lodash');
const { summary } = require('./summary');
const NEW_LINE = '\n';
const IGNORE = 'IGNORE';

const printUnchangedCategories = (unchangedCategories) => {
  for (let [k, v] of Object.entries(unchangedCategories)) {
    console.log(k, v.map(_ => [_.date, _.description, _.amount]))
  }
}

const printDebugOutput = (ignoredCredits, ignoredDebits, unchangedCreditCategories, unchangedDebitCategories) => {
  console.log('############ IGNORED CREDITS ###################')
  console.log(ignoredCredits)
  console.log('############ IGNORED DEBITS ###################')
  console.log(ignoredDebits)
  console.log('############ UNCHANGED CREDITS ###################')
  printUnchangedCategories(unchangedCreditCategories)
  console.log('############ UNCHANGED DEBITS ###################')
  printUnchangedCategories(unchangedDebitCategories)
}

const convertCsvToObjs = (csv) => {
  const [headers, ...lines] = csv.split(NEW_LINE);
  return lines.filter(Boolean).map(line => {
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

const rewriteCategories = (transactions) => {
  const unchangedCategories = {}
  const namespaces =
    Object
      .entries(summary)
      .map(([namespaceStr, value]) => ([namespaceStr.toLowerCase().split(','), value]))

  const umbrellaCategories = Object.values(summary).map(value => value.umbrellaCategory.toLowerCase())

  const rewrittenTransactions = transactions.map(t => {
    if (umbrellaCategories.includes(t.category.toLowerCase())) {
      return t
    } else {
      const matchingEntry = namespaces.find(
        ([namespaceArr, value]) =>
          namespaceArr.includes(t.category.toLowerCase())
      )

      if (matchingEntry) {
        t.category = matchingEntry[1].umbrellaCategory;
      } else {
        if (unchangedCategories[t.category]) {
          unchangedCategories[t.category].push(t)
        } else {
          unchangedCategories[t.category] = [t]
        }
      }
      return t;
    }
  })

  const [ignore, notIgnore] = partition(rewrittenTransactions, ['category', IGNORE])
  return [notIgnore, unchangedCategories, ignore];
}

const summarize = (transactions) => {
  const baseSummary = Object.values(summary).reduce((acc, next) =>
    ({ ...acc, ...(next.umbrellaCategory === IGNORE ? {} : { [next.umbrellaCategory]: 0 }) }), {})

  const summarizedTransactions = transactions.reduce((acc, t) => {
    const currentValue = acc[t.category] ?? 0;
    return { ...acc, ...({ [t.category]: currentValue + t.amount }) }
  }, baseSummary);

  const total = Object.values(summarizedTransactions).reduce((acc, v) => acc + v, 0);
  return { ...summarizedTransactions, Net: total };
}

const combineSummaries = (debitsSummary, creditsSummary) => {
  const mergedDebits = {}
  Object.entries(debitsSummary).forEach(([key, value]) => {
    mergedDebits[key] = debitsSummary[key] + creditsSummary[key]
  })

  return { ...mergedDebits, 'Total Expenses': debitsSummary.Net, 'Total Income': creditsSummary.Net }
}

const writeSummaryAsCsv = (filename, summary) => {
  const output = sortBy(Object.entries(summary), [([key, value]) => key])
    .map(([key, value]) => `${key}, ${parseFloat(value.toFixed(2))}`).join(NEW_LINE);

  fs.writeFileSync(`./${filename}.csv`, output)
}

const writeTransactionsAsCsv = (filename, transactions) => {
  const output = transactions.map(_ => `${_.date.toLocaleDateString()}, ${_.originalDescription.replace(/,/g, '')}, ${_.amount}, ${_.category.replace(/,/g, '')}, ${_.accountName.replace(/,/g, '')}`).join(NEW_LINE);

  fs.writeFileSync(`./${filename}.csv`, output)
}

const createFinancialSummary = (startDate, endDate) => {
  const objWithinDateRange = obj => obj.date >= startDate && obj.date <= endDate
  const csvTransactions = fs.readFileSync('./transactions.csv', { encoding: "utf8" });

  const transactions = convertCsvToObjs(csvTransactions)
  const transactionsWithoutTransfers = transactions.filter(
    transaction =>
      transaction.category !== 'Credit Card Payment' &&
      transaction.category !== 'College Savings' &&
      transaction.category !== 'Transfer' &&
      !(transaction.category === 'Financial' && transaction.description === 'Vanguard')
  );

  const [_debits, _credits] = partition(transactionsWithoutTransfers, ['transactionType', 'debit'])
  const negativeDebits = _debits.map(d => ({ ...d, amount: -d.amount }))
  const [debits, unchangedDebitCategories, ignoredDebits] = rewriteCategories(sortBy(negativeDebits, 'category').filter(objWithinDateRange))
  const [credits, unchangedCreditCategories, ignoredCredits] = rewriteCategories(sortBy(_credits, 'category').filter(objWithinDateRange))

  printDebugOutput(ignoredCredits, ignoredDebits, unchangedCreditCategories, unchangedDebitCategories)
  const combinedSummary = combineSummaries(summarize(debits), summarize(credits))

  writeTransactionsAsCsv('debits', debits)
  writeTransactionsAsCsv('credits', credits)
  writeSummaryAsCsv('combined.summary', combinedSummary)

}

createFinancialSummary(new Date('02/01/2022'), new Date('03/31/2022'))

/*
Todos
Some ww payments are for internet or reimbursements, those are definitely trnasfers
however some are DCFSA or HSA - those should not be ignored and should be treated as income. Do it manually for now. 
*/