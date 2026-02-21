import { CHECK, IGNORE, UNCATEGORIZABLE } from '../../constants'
import { convertSlashToDashDate, getLocalDate } from '../../utils/date'
import { SvcMatcher } from '../category'
import { AccountType } from './accountType'
import { TransactionType } from './transactionType'

const UNKNOWN = 'UNKNOWN'

export type SvcTransactionCtorArgs = {
  id?: number
  category?: string

  date: string | Date
  amount: string | number

  notes?: string
  transactionType: TransactionType
  accountName: string
  accountType: AccountType
  description: string
  metadata: Omit<SvcTransactionMetadata, AccountType.BANK> & {
    [AccountType.BANK]?: {
      checkNumber?: string | number
    }
  }
}

type SvcTransactionMetadata = {
  institutionTransactionType: string,
  [AccountType.BANK]: {
    checkNumber?: number
  }
  [AccountType.CREDIT]: {}
}


/*
  ** Used to represent the transaction within the business logic
  ** Constructor handles csv (string) inputs as well as db inputs
  ** Dates are assumed to be in user local time = server local time
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
    
    // db -> service uses date
    if (data.date instanceof Date) {
      this.date = data.date
    } else {
      // csv -> db sends mm-dd-yyyy strings
      if (data.date.includes('/')) {
        this.date = getLocalDate(convertSlashToDashDate(data.date))
      } else {
        // ui -> db sends utc date strings
        this.date = new Date(data.date)
      }
    }

    this.description = this.formatDescription(data.description)
    this.amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount

    const maybeCheckNumber = data.metadata[AccountType.BANK]?.checkNumber
    if (maybeCheckNumber) {
      if (typeof maybeCheckNumber === 'string') {
        this.metadata[AccountType.BANK] = { ...this.metadata[AccountType.BANK], checkNumber: parseInt(maybeCheckNumber, 10) }
      } else if (typeof maybeCheckNumber === 'number') {
        this.metadata[AccountType.BANK] = { ...this.metadata[AccountType.BANK], checkNumber: maybeCheckNumber }
      }
    }
  }

  assignCategory = (matchers: SvcMatcher[]) => {
    for (const matcher of matchers) {
      const { query, category } = matcher;

      const match = new RegExp(`\\b${query.toLowerCase().trim()}\\b`, 'i').test(this.description);

      if (match) {
        this.category = category
        break;
      }
    }

    if (this.category === UNKNOWN) {
      this.category = this.transactionType === TransactionType.DEBIT ? UNCATEGORIZABLE : IGNORE;
    }

    return this;
  };

  formatDescription = (description: string) => description.replace(/ +/g, ' ').replaceAll('&amp;', '_and_').replaceAll('*', ' ').replaceAll('"', '')

  isWithinDateRange = (startDate: Date, endDate: Date) => this.date >= startDate && this.date < endDate

  isUncategorizable = () => this.category === UNCATEGORIZABLE

  isUncategorizableOrCheck = () => this.isUncategorizable() || this.category === CHECK

  isNotTransfer = () => this.transactionType !== TransactionType.TRANSFER

  isDebit = () => this.transactionType === TransactionType.DEBIT

  isIgnore = () => this.category === IGNORE

  isNotIgnore = () => !this.isIgnore()
}