import { isTest } from '../config';
import { IGNORE, UNCATEGORIZABLE } from '../constants';
import { Matcher, MatcherType, Persistence } from '../persistence';
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

// export const getDbMatchers = async (): Promise<IDbMatchers> => {
//   let matchers;

//   try {
//     matchers = await Read.modifiedMatchers()
//   } catch (error: any) {
//     if (error.code = 'ENOENT') {
//       console.warn(`NO_MODIFIED_MATCHERS_USING_FINAL_MATCHERS`)
//       matchers = await Read.finalMatchers()
//     } else {
//       throw error
//     }
//   }

//   return matchers
// }

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

export type IUiMatcher = Omit<Matcher, 'type'> & { markedForDelete: boolean }
export const uiMatchersToDbMatchers = (
  uiMatchers: IUiMatcher[]
) => uiMatchers
  .map((matcher: IUiMatcher) => new Matcher({ ...matcher, type: undefined }))

  
// export const serviceMatchersToUiMatchers = (invertedDbMatchers: IInvertedDbMatchers) =>
//   Object.entries(invertedDbMatchers).reduce<IUiMatcher[]>((acc, [queries, value]) => {
//     queries.split(',').map(m => m.trim()).forEach(query => {
  //       acc.push({
    //         category: value.umbrellaCategory,
    //         query,
    //         markedForDelete: false
    //       })
    //     })
    //     return acc
    //   }, [])

// export const uiMatchersToDbMatchers = (uiMatchers: IUiMatcher[]) => {
  //   const arrayMatchers = uiMatchers.reduce((acc, matcher: IUiMatcher) => {
    //     acc[matcher.category] = (acc[matcher.category] ?? []).concat(matcher.query)
    //     return acc
    //   }, {} as { [key: string]: string[] })
    
    //   const dbMatchers = Object.entries(arrayMatchers).reduce((acc, [category, queries]) => {
      //     acc[category] = queries.join(',')
      //     return acc
      //   }, {} as IDbMatchers)
      
      //   return dbMatchers
      // }
          
