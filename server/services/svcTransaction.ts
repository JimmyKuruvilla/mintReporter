import { CHECK, IGNORE, UNCATEGORIZABLE } from '../constants'
import { AccountType, TransactionType } from '../persistence/transaction/transaction.dao'
import { ICategoryBucket } from './category'

const UNKNOWN = 'UNKNOWN'

interface SvcTransactionMetadata {
  chaseType: string,
  [AccountType.BANK]?: {
    checkNumber?: number
  }
}

export type UiTransaction = Omit<SvcTransactionCtorArgs, 'date'> & {
  date: Date
  checkNum?: number
  bankType?: string
}

export type SvcTransactionCtorArgs = {
  id?: number
  category: string

  date: string | Date
  amount: string | number
  
  notes?: string
  transactionType: TransactionType
  accountName: string
  accountType: AccountType
  description: string
  metadata: any
}

/*
** Used to represent the transaction within the business logic
** Constructor handles csv (string) inputs as well as db inputs
*/
export class SvcTransaction {
  id?: number
  category: string = UNKNOWN

  date: Date
  amount: number

  notes?: string
  transactionType!: TransactionType
  accountName!: string
  accountType!: AccountType
  description!: string
  metadata!: SvcTransactionMetadata

  constructor(data: SvcTransactionCtorArgs) {
    Object.assign(this, data)
    this.date = data.date instanceof Date ? data.date : new Date(data.date)
    this.amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount
    if (this?.metadata?.[AccountType.BANK]?.checkNumber) {
      this.metadata[AccountType.BANK].checkNumber = parseInt(data.metadata[AccountType.BANK].checkNumber, 10)
    }
  }

  assignCategory = (buckets: ICategoryBucket[]) => {
    for (const bucket of buckets) {
      const { fragments, categoryData } = bucket;

      for (const fragment of fragments) {
        const match = new RegExp(`\\b${fragment}\\b`, 'i').test(this.description);

        if (match) {
          this.category = categoryData.umbrellaCategory;
          break;
        }
      }

      if (this.category !== UNKNOWN) {
        break;
      }
    }

    if (this.category === UNKNOWN) {
      this.category = this.transactionType === TransactionType.DEBIT ? UNCATEGORIZABLE : IGNORE;
    }

    return this;
  };

  isWithinDateRange = (startDate: Date, endDate: Date) => this.date >= startDate && this.date <= endDate

  isUncategorizable = () => this.category === UNCATEGORIZABLE

  isUncategorizableOrCheck = () => this.isUncategorizable() || this.category === CHECK

  isNotTransfer = () => this.transactionType !== TransactionType.TRANSFER

  isDebit = () => this.transactionType === TransactionType.DEBIT

  isIgnore = () => this.category === IGNORE

  isNotIgnore = () => !this.isIgnore()
}