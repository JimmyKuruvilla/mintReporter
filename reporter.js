#!/usr/bin env node
const fs = require("fs");
const { sortBy, partition } = require('lodash');
const { umbrellasToZeroTotalMap, namespaces, umbrellaCategories } = require('./summary');
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
  console.log('############ Uncategorizable CREDITS ###################')
  printUnchangedCategories(unchangedCreditCategories)
  console.log('############ Uncategorizable DEBITS ###################')
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
  const summarizedTransactions = transactions.reduce((acc, t) => {
    const currentValue = acc[t.category] ?? 0;
    return { ...acc, ...({ [t.category]: currentValue + t.amount }) }
  }, umbrellasToZeroTotalMap);

  const total = Object.values(summarizedTransactions).reduce((acc, v) => acc + v, 0);
  return { ...summarizedTransactions, total };
}

const combineSummaries = (debitsSummary, creditsSummary) => {
  const mergedCategories = {}
  Object.entries(debitsSummary).forEach(([category, value]) => {
    mergedCategories[category] = debitsSummary[category] + creditsSummary[category]
  })

  mergedCategories['_Total Outgoing'] = debitsSummary.total
  mergedCategories['_Total Incoming'] = creditsSummary.total
  mergedCategories['_Net'] = mergedCategories.total;
  delete mergedCategories.total;
  return mergedCategories
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

createFinancialSummary(new Date('02/28/2023'), new Date('04/30/2023'));
