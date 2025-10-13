import { categoryActions } from '../domains/category/category.service'
import { remove, removeMany, listMany, read, traverse, write } from '../domains/file'
import { finalActions, modifiedActions } from '../domains/category/matcher.dbActions'
import { allActions, creditActions, debitActions } from '../domains/transaction/transaction.dbActions'

const file = {
  read,
  write,
  listMany,
  remove,
  removeMany,
  traverse
}

export const Persistence = {
  file,
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