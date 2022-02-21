#!/usr/bin env node
const fs = require("fs");
const { sortBy, partition } = require('lodash');
const { summary } = require('./summary');
const NEW_LINE = '\n';

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
        unchangedCategories[t.category] = true
      }

      return t;
    }
  })

  return [rewrittenTransactions, unchangedCategories];
}

const summarize = (transactions) => {
  const baseSummary = Object.values(summary).reduce((acc, next) => ({ ...acc, ...{ [next.umbrellaCategory]: 0 } }), {})

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

  return {...mergedDebits, 'Total Expenses': debitsSummary.Net, 'Total Income': creditsSummary.Net}
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
  const [debits, unchangedDebitCategories] = rewriteCategories(sortBy(negativeDebits, 'category').filter(objWithinDateRange))
  const [credits, unchangedCreditCategories] = rewriteCategories(sortBy(_credits, 'category').filter(objWithinDateRange))

  console.log('unchanged debits', Object.keys(unchangedDebitCategories))
  console.log('unchanged credits', Object.keys(unchangedCreditCategories))

  const combinedSummary = combineSummaries(summarize(debits), summarize(credits))
  
  writeTransactionsAsCsv('debits', debits)
  writeTransactionsAsCsv('credits', credits)
  writeSummaryAsCsv('combined.summary', combinedSummary)

}

createFinancialSummary(new Date('12/01/2021'), new Date('01/31/2022'))
