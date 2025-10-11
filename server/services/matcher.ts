import { isTest } from '../config';
import { IGNORE } from '../constants';
import { MatcherDAO, MatcherType, Persistence } from '../persistence';

const TestMatchers = {
  'has-dash': { umbrellaCategory: 'has dash', },
  'has number sign': { umbrellaCategory: 'has number sign', },
  'has star': { umbrellaCategory: 'with removed asterisk', },
  'website': { umbrellaCategory: 'contains .com', },
  'some company.com': { umbrellaCategory: 'website with removed asterisk', },
  'some_and_company': { umbrellaCategory: 'ampersand replacement', },
  'override-category': { umbrellaCategory: 'overridden category', },
  'ignore-test': { umbrellaCategory: IGNORE, }
};

export const getAvailableDbMatchers = async () => {
  let matchers;

  matchers = await Persistence.matchers.modified.read()
  if (!matchers.length) {
    console.warn(`NO_MODIFIED_MATCHERS_USING_FINAL_MATCHERS`)
    matchers = await Persistence.matchers.final.read()
  }

  return matchers
}

export const getDbMatchers = async (): Promise<IDbMatchers> => {
  let dbMatchers: IDbMatchers = {}

  const matchers = await getAvailableDbMatchers()

  dbMatchers = matchers.reduce((acc, matcher) => {
    acc[matcher.category] = `${acc[matcher.category] ? acc[matcher.category] + ',' : ''}${matcher.query}`
    return acc
  }, dbMatchers)

  return dbMatchers
}

export const getServiceMatchers = async (): Promise<IInvertedDbMatchers> => {
  return isTest ? TestMatchers : dbMatchersToServiceMatchers(await getDbMatchers())
}

export const getUiMatchers = async () => {
  const dbMatchers = await getAvailableDbMatchers()
  return dbMatchers.map(i => ({
    id: i.id,
    category: i.category,
    query: i.query,
    markedForDelete: false
  }))
}

export type IDbMatchers = { [umbrellaCategory: string]: string }
export type IInvertedDbMatchers = { [csvQueries: string]: { umbrellaCategory: string } }
export const dbMatchersToServiceMatchers = (dbMatchers: IDbMatchers) => {
  return Object.entries(dbMatchers).reduce<IInvertedDbMatchers>((acc, [umbrellaCategory, queries]) => {
    acc[queries] = { umbrellaCategory }
    return acc
  }, {})
}
// TODO all this is pretty complicated - is it neccessary still?

export type UiMatcher = Omit<SvcMatcherCtorArgs, 'type'> & { markedForDelete: boolean }

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