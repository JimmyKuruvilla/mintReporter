import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm'
import { SvcTransaction } from '../../services/transaction.svc'

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  TRANSFER = 'transfer'
}

export enum AccountType {
  BANK = 'bank_account',
  CREDIT = 'credit_card_account',
}

@Entity('categorized_transaction')
@Index('multi_column_unique', ['category', 'date', 'amount', 'type', 'description', 'accountName', 'accountType'], { unique: true })
export class CategorizedTransactionDAO {
  @Index('categorized_transaction_id_unique', { unique: true })
  @PrimaryGeneratedColumn()
  id?: number

  @Column('text')
  category: string

  @Column('text')
  date: string

  @Column('real')
  amount: number

  @Column('text')
  type: TransactionType

  @Column('text')
  description: string

  @Column('text')
  accountName: string

  @Column('text')
  accountType: AccountType

  @Column('text')
  institutionTransactionType: string // metadata.chaseType

  @Column({ type: 'int', nullable: true })
  checkNumber?: number // metadata.bank_account.checkNumber

  @Column({ type: 'text', nullable: true })
  notes?: string

  constructor(data: SvcTransaction) {
    this.id = data?.id
    this.category = data?.category
    this.notes = data?.notes
    this.accountName = data?.accountName
    this.accountType = data?.accountType
    this.amount = data?.amount
    this.date = data?.date.toISOString()
    this.description = data?.description
    this.institutionTransactionType = data?.metadata.chaseType
    this.checkNumber = data?.metadata?.[AccountType.BANK]?.checkNumber
    this.type = data?.transactionType
  }

  toSvc() {
    return new SvcTransaction({
      id: this.id!,
      category: this.category,

      notes: this.notes,
      accountName: this.accountName,
      accountType: this.accountType,
      amount: this.amount,
      date: new Date(this.date),
      description: this.description,
      metadata: {
        chaseType: this.institutionTransactionType, // TODO: rename globally
        [AccountType.BANK]: {
          checkNumber: this.checkNumber
        }
      },
      transactionType: this.type,
    })
  }
}