import { Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AbsTransaction } from './abs.transaction'

@Entity('transaction')
@Index('transaction_multi_column_unique', ['category', 'date', 'amount', 'type', 'description', 'accountName', 'accountType'], { unique: true })
export class DAOTransaction extends AbsTransaction{
  @Index('transaction_id_unique', { unique: true })
  @PrimaryGeneratedColumn()
  declare id?: number
}