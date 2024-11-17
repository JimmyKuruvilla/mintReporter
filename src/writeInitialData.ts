import fs from 'fs';
import { initialDataFilePath, IGNORE, UNCATEGORIZABLE, FILE_NAMES, CHECK } from './constants'
import { CategorizedTransaction } from './transaction'
import { filterUncategorizable } from './utils';

const getFields = (t: CategorizedTransaction) => [
  `date: ${t.date}`,
  `description: ${t.description}`,
  `category: ${t.category}`,
  `permanentCategory: ${t.permanentCategory}`,
  `amount: ${t.amount}`,
  `accountName: ${t.accountName}`,
  `chaseType: ${t.metadata.chaseType}`
]

export const writeInitialData = (debits: CategorizedTransaction[], credits: CategorizedTransaction[]) => {

  const uncategorizableDebits = debits.filter(filterUncategorizable)
  const categorizableDebits = debits.filter(i => !filterUncategorizable(i))
  const ignoredDebits = debits.filter(i => i.category === IGNORE)

  console.log('############ WRITING ALL DATA ###################')
  fs.writeFileSync(initialDataFilePath(FILE_NAMES.ALL_CREDITS), JSON.stringify(credits, null, 2))
  fs.writeFileSync(initialDataFilePath(FILE_NAMES.ALL_DEBITS), JSON.stringify(categorizableDebits, null, 2))

  console.log('############ KNOWN IGNORED DEBITS ###################')
  console.log(ignoredDebits.map(getFields))
  fs.writeFileSync(initialDataFilePath(FILE_NAMES.IGNORED_DEBITS), JSON.stringify(ignoredDebits, null, 2))

  console.log('############ UNCATEGORIZABLE DEBITS ###################')
  console.log(uncategorizableDebits.map(getFields))
  fs.writeFileSync(initialDataFilePath(FILE_NAMES.UNCATEGORIZABLE_DEBITS), JSON.stringify(uncategorizableDebits, null, 2))

  console.log('############ ALL CREDITS IGNORED / ARE CATEGORIZED AS IGNORE ###################')
}