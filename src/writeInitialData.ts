import fs from 'fs';
import { initialDataFilePath, IGNORE, UNCATEGORIZABLE } from './constants'
import { CategorizedTransaction } from './transaction'

const getFields = (t: CategorizedTransaction) => [
  `date: ${t.date}`,
  `description: ${t.description}`,
  `category: ${t.category}`,
  `oneTimeCategory: ${t.oneTimeCategory}`,
  `permanentCategory: ${t.permanentCategory}`,
  `amount: ${t.amount}`,
  `accountName: ${t.accountName}`,
  `chaseType: ${t.metadata.chaseType}`
]

export const writeInitialData = (debits: CategorizedTransaction[], credits: CategorizedTransaction[]) => {

  console.log('############ WRITING ALL DATA ###################')
  fs.writeFileSync(initialDataFilePath('credits.all'), JSON.stringify(credits, null, 2))
  fs.writeFileSync(initialDataFilePath('debits.all'), JSON.stringify(debits, null, 2))

  console.log('############ KNOWN IGNORED DEBITS ###################')
  const ignoredDebits = debits.filter(i => i.category === IGNORE)
  console.log(ignoredDebits.map(getFields))
  fs.writeFileSync(initialDataFilePath('debits.ignored'), JSON.stringify(ignoredDebits, null, 2))

  console.log('############ UNCATEGORIZABLE DEBITS ###################')
  const uncategorizableDebits = debits.filter(i => i.category === UNCATEGORIZABLE)
  console.log(uncategorizableDebits.map(getFields))
  fs.writeFileSync(initialDataFilePath('debits.uncategorizable'), JSON.stringify(uncategorizableDebits, null, 2))

  console.log('############ ALL CREDITS IGNORED / ARE CATEGORIZED AS IGNORE ###################')
}