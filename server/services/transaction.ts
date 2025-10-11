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
// ui -> server :: json -> service DTO  - thats this - but 2 steps is ugly. 
// it's only ugly because we're doing 2 things in the route controller. 
// server -> db :: serviceDTO -> db DAO - got this
// db -> server :: db DAO -> serviceDTO - got this
// server -> ui :: serviceDTO -> json   - implicit json handling
// can the typeorm classes have different names than their table name? call it DAO
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
