import fs from 'fs';
import { initialDataFilePath, IGNORE } from './constants'
import { CategorizedTransaction } from './transaction'

const getFields = (t: CategorizedTransaction) => [
  `date: ${t.date}`,
  `description: ${t.description}`,
  `category: ${t.category}`,
  `oneTimeCategory: ${t.metadata.oneTimeCategory}`,
  `amount: ${t.amount}`,
  `accountName: ${t.accountName}`,
  `chaseType: ${t.metadata.chaseType}`
]

export const writeInitialData = (originalDebits: CategorizedTransaction[], originalCredits: CategorizedTransaction[], debits: CategorizedTransaction[], credits: CategorizedTransaction[]) => {

  console.log('############ WRITING ALL DATA ###################')
  fs.writeFileSync(initialDataFilePath('credits.all'), JSON.stringify(originalCredits, null, 2))
  fs.writeFileSync(initialDataFilePath('debits.all'), JSON.stringify(originalDebits, null, 2))

  console.log('############ IGNORED CREDITS ###################')
  const ignoredCredits = originalCredits.filter(i => i.category === IGNORE)
  console.log(ignoredCredits.map(getFields))
  fs.writeFileSync(initialDataFilePath('credits.ignored'), JSON.stringify(ignoredCredits, null, 2))

  console.log('############ IGNORED DEBITS ###################')
  const ignoredDebits = originalDebits.filter(i => i.category === IGNORE)
  console.log(ignoredDebits.map(getFields))
  fs.writeFileSync(initialDataFilePath('debits.ignored'), JSON.stringify(ignoredDebits, null, 2))

  console.log('############ Uncategorizable CREDITS ###################')
  const uncategorizableCredits = credits.filter(i => !i.category)
  console.log(uncategorizableCredits.map(getFields))
  fs.writeFileSync(initialDataFilePath('credits.uncategorizable'), JSON.stringify(uncategorizableCredits, null, 2))

  console.log('############ Uncategorizable DEBITS ###################')
  const uncategorizableDebits = debits.filter(i => !i.category)
  console.log(uncategorizableDebits.map(getFields))
  fs.writeFileSync(initialDataFilePath('debits.uncategorizable'), JSON.stringify(uncategorizableDebits, null, 2))
}