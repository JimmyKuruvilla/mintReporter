import { Transaction } from './transaction'

const printUnchangedCategories = (unchangedCategories: { [date: string]: Transaction[] }) => {
  for (let [k, v] of Object.entries(unchangedCategories)) {
    console.log(k, v.map(_ => [_.date, _.description, _.amount]))
  }
}

export const printDebugOutput = (ignoredCredits: any, ignoredDebits: any, unchangedCreditCategories: any, unchangedDebitCategories: any) => {
  console.log('############ IGNORED CREDITS ###################')
  console.log(ignoredCredits)
  console.log('############ IGNORED DEBITS ###################')
  console.log(ignoredDebits)
  console.log('############ Uncategorizable CREDITS ###################')
  printUnchangedCategories(unchangedCreditCategories)
  console.log('############ Uncategorizable DEBITS ###################')
  printUnchangedCategories(unchangedDebitCategories)
}
