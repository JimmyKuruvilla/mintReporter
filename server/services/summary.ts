import { COMMA, IGNORE, TRANSACTION_TYPES, UNCATEGORIZABLE } from '../constants';
import { ICategorizedTransaction, ITransaction } from './transaction';
import { chain } from 'lodash';
import { Read, Write } from './data';
import { isTest } from '../config';


// import BaseCategories from '../categories/base.json'
// import { costaRica062024, santeFe062025 } from '../categories/vacations.json';
/*
  WW CCD is reimbursement and should be zeroed with some purchase, so tagged for manual changes
  WW PPD is salary and FSAs and should be counted as income
  - CCD is ignored, use an override to ignore a particular purchase so that it will be left out of totals.

  College Savings ACH is a bank ACH_DEBIT and not a transfer-type, but ignored here because it is just moving money to college funds, not actually an expense that was incurred
*/
// const Ignore = 'WW INTERNATIONAL PAYMENT CCD, College Savings ACH, ILD529'
// const Vacation = `${santeFe062025}, ${costaRica062024}, ${BaseCategories.Vacation}`
// export const categorySummary: ICategorySummary =
// {
//   [BaseCategories.Amusements]: { umbrellaCategory: 'Amusements', },
//   [BaseCategories.Auto]: { umbrellaCategory: 'Auto', },
//   [BaseCategories.Education]: { umbrellaCategory: 'Education', },
//   [BaseCategories.Emergency]: { umbrellaCategory: 'Emergency', },
//   [BaseCategories.Charity]: { umbrellaCategory: 'Charity', },
//   [BaseCategories.Check]: { umbrellaCategory: 'Check', },
//   [BaseCategories.Clothing]: { umbrellaCategory: 'Clothing', },
//   [BaseCategories.EatingOut]: { umbrellaCategory: 'EatingOut', },
//   [BaseCategories.Fees]: { umbrellaCategory: 'Fees', },
//   [BaseCategories.Gift]: { umbrellaCategory: 'Gift', },
//   [BaseCategories.HomeImprovement]: { umbrellaCategory: 'HomeImprovement', },
//   [BaseCategories.HomeMaintenance]: { umbrellaCategory: 'HomeMaintenance', },
//   [BaseCategories.Kid]: { umbrellaCategory: 'Kid', },
//   [BaseCategories.LawyerFees]: { umbrellaCategory: 'LawyerFees', },
//   [BaseCategories.Medical]: { umbrellaCategory: 'Medical', },
//   [BaseCategories.MetaCanada]: { umbrellaCategory: 'MetaCanada', },
//   [BaseCategories.MetaStan]: { umbrellaCategory: 'MetaStan', },
//   [BaseCategories.MetaOneTime]: { umbrellaCategory: 'MetaOneTime', },
//   [BaseCategories.MetaFood]: { umbrellaCategory: 'MetaFood', },
//   // ATM Withdrawal vs NON-CHASE ATM WITHDRAW captured by one string
//   [BaseCategories.Misc]: { umbrellaCategory: 'Misc', },
//   [BaseCategories.Mortgage]: { umbrellaCategory: 'Mortgage', },
//   [BaseCategories.PersonalCare]: { umbrellaCategory: 'PersonalCare', },
//   [BaseCategories.Pet]: { umbrellaCategory: 'Pet', },
//   [BaseCategories.Shopping]: { umbrellaCategory: 'Shopping', },
//   [BaseCategories.Utilities]: { umbrellaCategory: 'Utilities', },

//   [Vacation]: { umbrellaCategory: 'Vacation', },

//   [Ignore]: { umbrellaCategory: IGNORE, },
// }

export let invertedDbMatchers: IInvertedDbMatchers = {};

export type IDbMatchers = { [umbrellaCategory: string]: string }
export type IInvertedDbMatchers = { [csvQueries: string]: { umbrellaCategory: string } }
export const dbMatchersToServiceMatchers = (dbMatchers: IDbMatchers) => {
  return Object.entries(dbMatchers).reduce<IInvertedDbMatchers>((acc, [umbrellaCategory, queries]) => {
    acc[queries] = { umbrellaCategory }
    return acc
  }, {})
}

/**
 * returns{[umbrellaCategory]: [matcherStr, matcherStr]}
*/
export type IUiMatchers = { [umbrellaCategory: string]: string[] }
export const serviceMatchersToUiMatchers = (invertedDbMatchers: IInvertedDbMatchers) =>
  Object.entries(invertedDbMatchers).reduce<IUiMatchers>((acc, [queries, value]) => {
    acc[value.umbrellaCategory] = queries.split(',').map(m => m.trim())
    return acc
  }, {})

export const uiMatchersToDbMatchers = (uiMatchers: IUiMatchers) => {
  return Object.entries(uiMatchers).reduce<IDbMatchers>((acc, [umbrellaCategory, queries]) => {
    acc[umbrellaCategory] = queries.join(',')
    return acc
  }, {})
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

// this is really dumb - but it works. Just get top level await working. Just copying to keep the object reference in the export
(async () => {
  const props = dbMatchersToServiceMatchers(await Read.matchers())
  Object.keys(props).forEach(key => {
    invertedDbMatchers[key] = props[key]
  })
})()

export const isNotTransfer = (transaction: ITransaction) => transaction.transactionType !== TRANSACTION_TYPES.TRANSFER
export const isDebit = (transaction: ITransaction) => transaction.transactionType === TRANSACTION_TYPES.DEBIT
export const isIgnore = (transaction: ICategorizedTransaction) => transaction.category === IGNORE
export const isNotIgnore = (transaction: ICategorizedTransaction) => !isIgnore(transaction)

const targetSummary = isTest ? testSummary : invertedDbMatchers

type UmbrellaCategoryAcc = { [index: string]: number }
const getUmbrellaCategoryAcc: () => UmbrellaCategoryAcc = () => {
  const cats: UmbrellaCategoryAcc = Object.values(targetSummary).reduce((acc, next) =>
    ({ ...acc, ... { [next.umbrellaCategory]: 0 } }), {})
  cats[UNCATEGORIZABLE] = 0
  return cats;
}

export const getUmbrellaCategories = async () => {
  const matchers = await Read.matchers()
  return Object.keys(matchers)
}

export type Bucket = { fragments: string[], categoryData: { umbrellaCategory: string } }
export const getBuckets: () => Bucket[] = () => Object.entries(targetSummary)
  .map(([namespace, data]) =>
  ({
    fragments: namespace.toLowerCase().split(COMMA).map(fragment => fragment.trim()).filter(Boolean),
    categoryData: data
  }))

export type UmbrellaCategoryAccWithTotal = UmbrellaCategoryAcc & { total: number }
export const summarize = (transactions: ICategorizedTransaction[]): UmbrellaCategoryAccWithTotal => {
  const summarizedTransactions = transactions.reduce((acc, t) => {
    const currentValue = acc[t.category] ?? 0;

    return { ...acc, ...({ [t.category]: currentValue + t.amount }) }
  }, getUmbrellaCategoryAcc());

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
export const assignCategories = (t: any): ICategorizedTransaction => {
  const buckets = getBuckets()
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