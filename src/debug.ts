import { IGNORE } from './constants'
import { Transaction } from './transaction'

const getFields = (t: Transaction) => [t.date, t.description, t.category, t.amount, t.accountName, `chaseType: ${t.metadata.chaseType}`]

export const printDebugOutput = (originalDebits: Transaction[], originalCredits: Transaction[], debits: Transaction[], credits: Transaction[]) => {

  console.log('############ IGNORED CREDITS ###################')
  console.log(originalCredits.filter(i => i.category === IGNORE))

  console.log('############ IGNORED DEBITS ###################')
  console.log(originalDebits.filter(i => i.category === IGNORE))

  console.log('############ Uncategorizable CREDITS ###################')
  console.log(credits.filter(i => !i.category).map(getFields))

  console.log('############ Uncategorizable DEBITS ###################')
  console.log(debits.filter(i => !i.category).map(getFields))
}
