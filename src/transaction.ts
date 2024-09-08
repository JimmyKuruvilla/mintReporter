import { ACCOUNTS } from './accounts'
import { TRANSACTION_TYPES } from './constants'

interface Metadata {
  chaseType: string,
  oneTimeCategory?: string
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
}

type TransactionJson = { [Property in keyof Transaction]: any }

export const Transaction = (data: TransactionJson): Transaction => {
  return {
    date: new Date(data.date),
    amount: parseFloat(data.amount),
    metadata: { oneTimeCategory: '', ...data.metadata },
    description: data.description,
    transactionType: data.transactionType,
    accountName: data.accountName,
    accountType: data.accountType,
    notes: data.notes
  }
}

export const CategorizedTransaction = (data: TransactionJson & { category: string }): CategorizedTransaction => {
  return {
    ...Transaction(data),
    category: data.category
  }
}