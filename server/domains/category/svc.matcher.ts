import { MatcherType } from './matcherType';

export type SvcMatcherCtorArgs = {
  id?: number,
  category: string,
  query: string,
  type: MatcherType
}

export class SvcMatcher {
  id?: number
  category!: string
  query!: string
  type!: MatcherType

  constructor(data: SvcMatcherCtorArgs) {
    Object.assign(this, data)
  }
}