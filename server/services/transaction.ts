import { ACCOUNTS } from './account'
import { TRANSACTION_TYPES } from '../constants'

interface IMetadata {
  chaseType: string,
  [ACCOUNTS.BANK]?: {
    checkNumber?: string
  }
}

export interface ITransaction {
  date: Date,
  description: string,
  amount: number,
  transactionType: TRANSACTION_TYPES,
  metadata: IMetadata,
  accountName: string,
  accountType: ACCOUNTS,
  notes?: string
}

export interface ICategorizedTransaction extends ITransaction {
  category: string
  permanentCategory: string
  permanentCategoryQuery: string
}

export type ITransactionJson = { [Property in keyof ITransaction]: any }
export type ICategorizedTransactionJson = { [Property in keyof ICategorizedTransaction]: any }

export const Transaction = (data: ITransactionJson): ITransaction => {
  return {
    date: new Date(data.date),
    amount: parseFloat(data.amount),
    metadata: data.metadata,
    description: data.description,
    transactionType: data.transactionType,
    accountName: data.accountName,
    accountType: data.accountType,
    notes: data.notes
  }
}

export const CategorizedTransaction = (data: ICategorizedTransactionJson): ICategorizedTransaction => {
  return {
    ...Transaction(data),
    category: data.category,
    permanentCategory: data.permanentCategory ?? '',
    permanentCategoryQuery: data.permanentCategoryQuery ?? ''
  }
}