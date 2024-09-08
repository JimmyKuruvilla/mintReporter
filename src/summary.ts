import { COMMA, IGNORE, TRANSACTION_TYPES, UNCATEGORIZABLE, isTest } from './constants';
import { costaRica062024 } from './categories/vacations.json';
import { CategorizedTransaction, Transaction } from './transaction';
import BaseCategories from './categories/base.json'
/*
  WW CCD is reimbursement and should be zeroed with some purchase, so tagged for manual changes
  WW PPD is salary and FSAs and should be counted as income
  - CCD is ignored, use an override to ignore a particular purchase so that it will be left out of totals.

  College Savings ACH is a bank ACH_DEBIT and not a transfer-type, but ignored here because it is just moving money to college funds, not actually an expense that was incurred
*/
const Ignore = 'WW INTERNATIONAL PAYMENT CCD, College Savings ACH, peloton'
const Vacation = `${costaRica062024}, ${BaseCategories.Vacation}`

const categorySummary =
{
  [BaseCategories.Amusements]: { umbrellaCategory: 'Amusements', },
  [BaseCategories.Auto]: { umbrellaCategory: 'Auto & Transport', },
  [BaseCategories.Education]: { umbrellaCategory: 'Education', },
  [BaseCategories.Emergency]: { umbrellaCategory: 'Emergency', },
  [BaseCategories.Charity]: { umbrellaCategory: 'Charity', },
  [BaseCategories.Check]: { umbrellaCategory: 'Check', },
  [BaseCategories.Clothing]: { umbrellaCategory: 'Clothing', },
  [BaseCategories.EatingOut]: { umbrellaCategory: 'Eating Out', },
  [BaseCategories.Fees]: { umbrellaCategory: 'Fees', },
  [BaseCategories.Gift]: { umbrellaCategory: 'Gift', },
  [BaseCategories.HomeImprovement]: { umbrellaCategory: 'Home Improvement', },
  [BaseCategories.HomeMaintenance]: { umbrellaCategory: 'Home Maintenance', },
  [BaseCategories.Kid]: { umbrellaCategory: 'Kid', },
  [BaseCategories.LawyerFees]: { umbrellaCategory: 'Lawyer Fees', },
  [BaseCategories.Medical]: { umbrellaCategory: 'Medical', },
  [BaseCategories.MetaCanada]: { umbrellaCategory: 'Meta Canada', },
  [BaseCategories.MetaStan]: { umbrellaCategory: 'Meta Stan', },
  [BaseCategories.MetaOneTime]: { umbrellaCategory: 'Meta OneTime', },
  [BaseCategories.MetaFood]: { umbrellaCategory: 'Meta Food', },
  // ATM Withdrawal vs NON-CHASE ATM WITHDRAW captured by one string
  [BaseCategories.Misc]: { umbrellaCategory: 'Misc', },
  [BaseCategories.Mortgage]: { umbrellaCategory: 'Mortgage & Rent', },
  [BaseCategories.PersonalCare]: { umbrellaCategory: 'Personal Care', },
  [BaseCategories.Pet]: { umbrellaCategory: 'Pet', },
  [BaseCategories.Shopping]: { umbrellaCategory: 'Shopping', },
  [BaseCategories.Utilities]: { umbrellaCategory: 'Utilities', },

  [Vacation]: { umbrellaCategory: 'Vacation', },

  [Ignore]: { umbrellaCategory: IGNORE, },
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
}

const targetSummary = isTest ? testSummary : categorySummary
export const isNotTransfer = (transaction: Transaction) => transaction.transactionType !== TRANSACTION_TYPES.TRANSFER
export const isNotIgnore = (transaction: CategorizedTransaction) => transaction.category !== IGNORE

type CategoryValues = { [index: string]: number }
const umbrellaCategoryAcc: CategoryValues = Object.values(targetSummary).reduce((acc, next) =>
  ({ ...acc, ... { [next.umbrellaCategory]: 0 } }), {})
umbrellaCategoryAcc[UNCATEGORIZABLE] = 0

export type Summary = CategoryValues & { total: number }
export const summarize = (transactions: CategorizedTransaction[]): Summary => {
  const summarizedTransactions = transactions.reduce((acc, t) => {
    const currentValue = acc[t.category] ?? 0;

    return { ...acc, ...({ [t.category]: currentValue + t.amount }) }
  }, umbrellaCategoryAcc);

  const total = Object.values(summarizedTransactions).reduce((acc, v) => acc + v, 0);
  return { ...summarizedTransactions, total };
}

export type CombinedSummary = Omit<Summary, 'total'> & { _TotalOutgoing: number, _totalIncoming: number, _Net: number }
export const combineSummaries = (debitsSummary: Summary, creditsSummary: Summary) => {
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

export type Bucket = { fragments: string[], categoryData: { umbrellaCategory: string } }
export const buckets: Bucket[] = Object.entries(targetSummary)
  .map(([namespace, data]) =>
  ({
    fragments: namespace.toLowerCase().split(COMMA).map(fragment => fragment.trim()).filter(Boolean),
    categoryData: data
  }))

export const assignCategories = (_t: Transaction | CategorizedTransaction): CategorizedTransaction => {
  const t = _t as CategorizedTransaction
  t.oneTimeCategory = t.oneTimeCategory ?? ''
  t.permanentCategory = t.permanentCategory ?? ''

  if (t.oneTimeCategory) {
    t.category = t.oneTimeCategory
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