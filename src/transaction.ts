import { ACCOUNTS } from './accounts'
import { TRANSACTION_TYPES } from './constants'

interface Metadata {
  chaseType: string,
  overrideCategory?: string
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
  category: string,
  notes?: string
}

export const Transaction = (
  date: string,
  description: string,
  amount: string,
  transactionType: TRANSACTION_TYPES,
  metadata: Metadata,
  accountName: string,
  accountType: ACCOUNTS,
  notes?: string,
  ): Transaction => ({
    date: new Date(date),
    description,
    amount: parseFloat(amount),
    transactionType,
    metadata,
    accountName,
    accountType,
    category: '',
    notes
  })

