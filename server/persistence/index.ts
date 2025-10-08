import 'reflect-metadata'
import { db } from './db'
import { finalActions, modifiedActions } from './matcher/matcher.actions'
import { debitActions, creditActions } from './transaction/transaction.actions'
export * from './matcher/matcher.entity'
export * from './transaction/transaction.entity'

export const Persistence = {
  db,
  matchers: {
    final: finalActions,
    modified: modifiedActions
  },
  transactions: {
    debits: debitActions,
    credits: creditActions
  }
}
