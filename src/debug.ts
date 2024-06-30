import { IGNORE } from './constants'
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

export const printDebugOutput = (originalDebits: Transaction[], originalCredits: Transaction[], debits: Transaction[], credits: Transaction[]) => {

  console.log('############ IGNORED CREDITS ###################')
  console.log(originalCredits.filter(i => i.category === IGNORE).map(getFields))

  console.log('############ IGNORED DEBITS ###################')
  console.log(originalDebits.filter(i => i.category === IGNORE).map(getFields))

  console.log('############ Uncategorizable CREDITS ###################')
  console.log(credits.filter(i => !i.category).map(getFields))

  console.log('############ Uncategorizable DEBITS ###################')
  console.log(debits.filter(i => !i.category).map(getFields))
}


// data all set, make a commit for formotting, now just categoryize. 