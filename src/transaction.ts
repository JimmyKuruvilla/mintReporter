import { ACCOUNTS } from './accounts'
import { TRANSACTION_TYPES } from './constants'

interface Metadata {
  chaseType: string,
  [ACCOUNTS.BANK]?: {
    checkNumber?: string
  }
}

export interface Transaction {
  date: Date,
  description: string,
  amount: number,
  transactionType: TRANSACTION_TYPES,
  metadata: Metadata,
  accountName: string,
  accountType: ACCOUNTS,
  notes?: string
}

export interface CategorizedTransaction extends Transaction {
  category: string
  oneTimeCategory: string,
  permanentCategory: string
}

export type TransactionJson = { [Property in keyof Transaction]: any }
export type CategorizedTransactionJson = { [Property in keyof CategorizedTransaction]: any }

export const Transaction = (data: TransactionJson): Transaction => {
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

export const hydrateCategorizedTransaction = (data: CategorizedTransactionJson): CategorizedTransaction => {
  return {
    ...Transaction(data),
    category: data.category,
    oneTimeCategory: data.oneTimeCategory,
    permanentCategory: data.permanentCategory
  }
}