import { Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { AbsTransaction } from './abs.transaction'

@Entity('historical_transaction')
@Index('historical_transaction_multi_column_unique', ['category', 'date', 'amount', 'type', 'description', 'accountName', 'accountType'], { unique: true })
export class DAOHistoricalTransaction extends AbsTransaction {
  @Index('historical_transaction_id_unique', { unique: true })
  @PrimaryGeneratedColumn()
  declare id?: number
}