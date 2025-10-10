import { AccountType, TransactionType } from '../persistence/transaction/transaction.entity'

interface IMetadata {
  chaseType: string,
  [AccountType.BANK]?: {
    checkNumber?: number
  }
}

export interface ITransactionDTO {
  id?: number,
  accountName: string,
  accountType: AccountType,
  amount: number,
  date: Date,
  description: string,
  metadata: IMetadata,
  notes?: string
  transactionType: TransactionType,
}

export interface ICategorizedTransactionDTO extends ITransactionDTO {
  id: number
  category: string
}

// TODO convert to actual classes 
// ui -> server :: json -> service DTO  - need this
// server -> db :: serviceDTO -> db DAO - got this
// db -> server :: db DAO -> serviceDTO - got this
// server -> ui :: serviceDTO -> json   - implicit json handling
export const TransactionDTO = (data: any): ITransactionDTO => {
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

export const CategorizedTransactionDTO = (data: any): ICategorizedTransactionDTO => {
  return {
    ...TransactionDTO(data),
    category: data.category,
    id: data.id
  }
}
