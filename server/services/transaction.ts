import { Accounts } from './account'

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  TRANSFER = 'transfer'
}

interface IMetadata {
  chaseType: string,
  [Accounts.BANK]?: {
    checkNumber?: string
  }
}

export interface ITransaction {
  date: Date,
  description: string,
  amount: number,
  transactionType: TransactionType,
  metadata: IMetadata,
  accountName: string,
  accountType: Accounts,
  notes?: string
}

export interface ICategorizedTransaction extends ITransaction {
  category: string
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
    category: data.category
  }
}
