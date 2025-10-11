import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm'
import { SvcMatcher } from '../../services'

export enum MatcherType {
  FINAL = 'final',
  MODIFIED = 'modified',
  EMPTY = 'empty'
}

@Entity('matcher')
@Index('matcher_compound_unique', ['category', 'query', 'type'], { unique: true })
export class MatcherDAO {
  @Index('matcher_id_unique', { unique: true })
  @PrimaryGeneratedColumn()
  id?: number

  @Column('text')
  category: string

  @Column('text')
  query: string

  @Column('text')
  type: MatcherType

  constructor(data: SvcMatcher) {
    this.id = data?.id
    this.category = data?.category
    this.query = data?.query
    if (data?.type === MatcherType.EMPTY) {
      throw new Error(`ILLEGAL_MATCHER_TYPE ${data.type}`)
    } else {
      this.type = data?.type
    }
  }

  toSvc(): SvcMatcher {
    return new SvcMatcher({
      id: this.id,
      category: this.category,
      query: this.query,
      type: this.type
    })
  }
}