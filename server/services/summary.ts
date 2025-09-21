import { COMMA, IGNORE, TRANSACTION_TYPES, UNCATEGORIZABLE } from '../constants';
import { ICategorizedTransaction, ITransaction } from './transaction';
import { chain } from 'lodash';
import { Read } from './data';
import { isTest } from '../config';

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
  return isTest ? testSummary : dbMatchersToServiceMatchers(await getDbMatchers())
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

export type IUiMatcher = { id?: number, category: string, query: string }
export const serviceMatchersToUiMatchers = (invertedDbMatchers: IInvertedDbMatchers) =>
  Object.entries(invertedDbMatchers).reduce<IUiMatcher[]>((acc, [queries, value]) => {
    queries.split(',').map(m => m.trim()).forEach(query => {
      acc.push({
        category: value.umbrellaCategory,
        query
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

const testSummary = {
  'has-dash': { umbrellaCategory: 'has dash', },
  'has number sign': { umbrellaCategory: 'has number sign', },
  'has star': { umbrellaCategory: 'with removed asterisk', },
  'website': { umbrellaCategory: 'contains .com', },
  'some company.com': { umbrellaCategory: 'website with removed asterisk', },
  'some_and_company': { umbrellaCategory: 'ampersand replacement', },
  'override-category': { umbrellaCategory: 'overridden category', },
  'ignore-test': { umbrellaCategory: IGNORE, }
};

export const isNotTransfer = (transaction: ITransaction) => transaction.transactionType !== TRANSACTION_TYPES.TRANSFER
export const isDebit = (transaction: ITransaction) => transaction.transactionType === TRANSACTION_TYPES.DEBIT
export const isIgnore = (transaction: ICategorizedTransaction) => transaction.category === IGNORE
export const isNotIgnore = (transaction: ICategorizedTransaction) => !isIgnore(transaction)

type UmbrellaCategoryAcc = { [umbrellaCategory: string]: number }
export const getUmbrellaCategoryAcc = async () => {
  const matchers = await getServiceMatchers()
  const cats: UmbrellaCategoryAcc = Object.values(matchers).reduce((acc, next) =>
    ({ ...acc, ... { [next.umbrellaCategory]: 0 } }), {})
  cats[UNCATEGORIZABLE] = 0
  cats[IGNORE] = 0
  return cats;
}

export const getUmbrellaCategories = async () => {
  const matchers = await getDbMatchers()
  return Object.keys(matchers)
}

export const getUiUmbrellaCategories = async () => {
  return [...(await getUmbrellaCategories()), UNCATEGORIZABLE, IGNORE]
}

export type Bucket = { fragments: string[], categoryData: { umbrellaCategory: string } }
export const getBuckets: () => Promise<Bucket[]> = async () => {
  const matchers = await getServiceMatchers()
  return Object.entries(matchers)
    .map(([csvQueries, data]) =>
    ({
      fragments: csvQueries.toLowerCase().split(COMMA).map(fragment => fragment.trim()).filter(Boolean),
      categoryData: data
    }))
}

export type UmbrellaCategoryAccWithTotal = UmbrellaCategoryAcc & { total: number }
export const summarize = (umbrellaCategoryAcc: UmbrellaCategoryAcc, transactions: ICategorizedTransaction[]): UmbrellaCategoryAccWithTotal => {
  const summarizedTransactions = transactions.reduce((acc, t) => {
    const currentValue = acc[t.category] ?? 0;

    return { ...acc, ...({ [t.category]: currentValue + t.amount }) }
  }, umbrellaCategoryAcc);

  const [firstTransaction] = transactions
  let total;

  if (isDebit(firstTransaction)) {
    total = chain(summarizedTransactions).omit(IGNORE).reduce((acc, v) => acc + v, 0).value();
  } else {
    total = chain(summarizedTransactions).reduce((acc, v) => acc + v, 0).value();
  }
  return { ...summarizedTransactions, total };
}

export type CombinedSummary = Omit<UmbrellaCategoryAccWithTotal, 'total'> & { _TotalOutgoing: number, _totalIncoming: number, _Net: number }
export const combineSummaries = (debitsSummary: UmbrellaCategoryAccWithTotal, creditsSummary: UmbrellaCategoryAccWithTotal) => {
  const mergedCategories: any = {}
  Object.entries(debitsSummary).forEach(([category, value]) => {
    mergedCategories[category] = debitsSummary[category] + creditsSummary[category]
  })

  mergedCategories['_TotalOutgoing'] = debitsSummary.total
  mergedCategories['_TotalIncoming'] = creditsSummary.total
  mergedCategories['_Net'] = mergedCategories.total;
  delete mergedCategories.total;
  return mergedCategories as CombinedSummary
}

/**
 * Used with ITransaction | ICategorizedTransaction inputs
 */
export const assignCategories = (buckets: Bucket[]) => (t: any): ICategorizedTransaction => {
  if (t.permanentCategory) {
    t.category = t.permanentCategory
  } else {
    for (const bucket of buckets) {
      const { fragments, categoryData } = bucket

      for (const fragment of fragments) {
        const match = new RegExp(`\\b${fragment}\\b`, 'i').test(t.description)

        if (match) {
          t.category = categoryData.umbrellaCategory
          break;
        }
      }

      if (t.category) {
        break;
      }
    }
  }

  if (!t.category) {
    t.category = t.transactionType === TRANSACTION_TYPES.DEBIT ? UNCATEGORIZABLE : IGNORE
  }

  return t;
}