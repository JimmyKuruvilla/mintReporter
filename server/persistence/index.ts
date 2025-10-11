import 'reflect-metadata'
import { db } from './db'
import { finalActions, modifiedActions } from './matcher/matcher.actions'
import { debitActions, creditActions, allActions } from './transaction/transaction.actions'
import { categoryActions } from './categories/category.actions'
export * from './matcher/matcher.dao'
export * from './transaction/transaction.dao'

export const Persistence = {
  db,
  matchers: {
    final: finalActions,
    modified: modifiedActions
  },
  categories: categoryActions,
  transactions: {
    all: allActions,
    debits: debitActions,
    credits: creditActions
  }
}
