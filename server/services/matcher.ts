import { isTest } from '../config';
import { IGNORE } from '../constants';
import { Read } from './data';

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

export const getDbMatchers = async (): Promise<IDbMatchers> => {
  let matchers;

  try {
    matchers = await Read.modifiedMatchers()
  } catch (error: any) {
    if (error.code = 'ENOENT') {
      console.warn(`NO_MODIFIED_MATCHERS_USING_FINAL_MATCHERS`)
      matchers = await Read.finalMatchers()
    } else {
      throw error
    }
  }

  return matchers
}

export const getServiceMatchers = async (): Promise<IInvertedDbMatchers> => {
  return isTest ? TestMatchers : dbMatchersToServiceMatchers(await getDbMatchers())
}

export const getUiMatchers = async () => {
  return serviceMatchersToUiMatchers(await getServiceMatchers())
}

export type IDbMatchers = { [umbrellaCategory: string]: string }
export type IInvertedDbMatchers = { [csvQueries: string]: { umbrellaCategory: string } }
export const dbMatchersToServiceMatchers = (dbMatchers: IDbMatchers) => {
  return Object.entries(dbMatchers).reduce<IInvertedDbMatchers>((acc, [umbrellaCategory, queries]) => {
    acc[queries] = { umbrellaCategory }
    return acc
  }, {})
}

export type IUiMatcher = { id?: number, category: string, query: string, markedForDelete: boolean }
export const serviceMatchersToUiMatchers = (invertedDbMatchers: IInvertedDbMatchers) =>
  Object.entries(invertedDbMatchers).reduce<IUiMatcher[]>((acc, [queries, value]) => {
    queries.split(',').map(m => m.trim()).forEach(query => {
      acc.push({
        category: value.umbrellaCategory,
        query,
        markedForDelete: false
      })
    })
    return acc
  }, [])

export const uiMatchersToDbMatchers = (uiMatchers: IUiMatcher[]) => {
  const arrayMatchers = uiMatchers.reduce((acc, matcher: IUiMatcher) => {
    acc[matcher.category] = (acc[matcher.category] ?? []).concat(matcher.query)
    return acc
  }, {} as { [key: string]: string[] })

  const dbMatchers = Object.entries(arrayMatchers).reduce((acc, [category, queries]) => {
    acc[category] = queries.join(',')
    return acc
  }, {} as IDbMatchers)

  return dbMatchers
}
