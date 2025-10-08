import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm'

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  TRANSFER = 'transfer'
}

export enum AccountType {
  BANK = 'bank_account',
  CREDIT = 'credit_card_account',
}

@Entity()
export class Transaction {
  @Index('transaction_id_unique', { unique: true })
  @PrimaryGeneratedColumn()
  id: number | undefined

  @Column('text')
  category!: string

  @Column('text')
  date!: string

  @Column('real')
  amount!: number

  @Column('text')
  type!: TransactionType

  @Column('text')
  description!: string

  @Column('text')
  accountName!: string
  
  @Column('text')
  accountType!: AccountType
  
  @Column('text')
  institutionTransactionType!: string // metadata.chaseType
  
  @Column({ type: 'int', nullable: true })
  checkId!: number // metadata.bank_account.checkNumber
  
  @Column({ type: 'text', nullable: true })
  notes!: string

  constructor(data: Partial<Transaction>) {
    Object.assign(this, data)
  }
}