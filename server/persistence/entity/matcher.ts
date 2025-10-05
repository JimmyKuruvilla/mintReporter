import 'reflect-metadata'
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm'
export type MatcherType = 'final' | 'modified'

@Entity()
@Index('matcher_compound_unique', ['category', 'query', 'type'], { unique: true })
export class Matcher {
  @Index('matcher_id_unique', { unique: true })
  @PrimaryGeneratedColumn()
  id: number | undefined

  @Column('text')
  category!: string

  @Column('text')
  query!: string

  @Column('text')
  type!: MatcherType

  constructor(data: { [Property in keyof Matcher]: any }) {
    this.category = data?.category
    this.query = data?.query
    this.type = data?.type
    this.id = data?.id
  }
}