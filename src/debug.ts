import fs from 'fs';
import { debugOutputFilePath, IGNORE } from './constants'
import { Transaction } from './transaction'

const getFields = (t: Transaction) => [
  `date: ${t.date}`,
  `description: ${t.description}`,
  `category: ${t.category}`,
  `amount: ${t.amount}`,
  `accountName: ${t.accountName}`,
  `chaseType: ${t.metadata.chaseType}`,
  `overrideCategory: ${t.metadata.overrideCategory}`
]

export const logDebugOutput = (originalDebits: Transaction[], originalCredits: Transaction[], debits: Transaction[], credits: Transaction[]) => {

  console.log('############ IGNORED CREDITS ###################')
  const ignoredCredits = originalCredits.filter(i => i.category === IGNORE)
  console.log(ignoredCredits.map(getFields))
  fs.writeFileSync(debugOutputFilePath('credits.ignored.json'), JSON.stringify(ignoredCredits, null, 2))

  console.log('############ IGNORED DEBITS ###################')
  const ignoredDebits = originalDebits.filter(i => i.category === IGNORE)
  console.log(ignoredDebits.map(getFields))
  fs.writeFileSync(debugOutputFilePath('debits.ignored.json'), JSON.stringify(ignoredDebits, null, 2))

  console.log('############ Uncategorizable CREDITS ###################')
  const uncategorizableCredits = credits.filter(i => !i.category)
  console.log(uncategorizableCredits.map(getFields))
  fs.writeFileSync(debugOutputFilePath('credits.uncategorizable.json'), JSON.stringify(uncategorizableCredits, null, 2))

  console.log('############ Uncategorizable DEBITS ###################')
  const uncategorizableDebits = debits.filter(i => !i.category)
  console.log(uncategorizableDebits.map(getFields))
  fs.writeFileSync(debugOutputFilePath('debits.uncategorizable.json'), JSON.stringify(uncategorizableDebits, null, 2))
}


// data all set, make a commit for formotting, now just categoryize. 