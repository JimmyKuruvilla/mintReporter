import { COMMA, IGNORE, TRANSACTION_TYPES, UNCATEGORIZABLE, isTest } from '../constants';
import { costaRica062024, santeFe062025 } from '../categories/vacations.json';
import { ICategorizedTransaction, ITransaction } from './transaction';
import BaseCategories from '../categories/base.json'
import { chain } from 'lodash';
/*
  WW CCD is reimbursement and should be zeroed with some purchase, so tagged for manual changes
  WW PPD is salary and FSAs and should be counted as income
  - CCD is ignored, use an override to ignore a particular purchase so that it will be left out of totals.

  College Savings ACH is a bank ACH_DEBIT and not a transfer-type, but ignored here because it is just moving money to college funds, not actually an expense that was incurred
*/
const Ignore = 'WW INTERNATIONAL PAYMENT CCD, College Savings ACH, ILD529'
const Vacation = `${santeFe062025}, ${costaRica062024}, ${BaseCategories.Vacation}`

const categorySummary =
{
  [BaseCategories.Amusements]: { umbrellaCategory: 'Amusements', },
  [BaseCategories.Auto]: { umbrellaCategory: 'Auto', },
  [BaseCategories.Education]: { umbrellaCategory: 'Education', },
  [BaseCategories.Emergency]: { umbrellaCategory: 'Emergency', },
  [BaseCategories.Charity]: { umbrellaCategory: 'Charity', },
  [BaseCategories.Check]: { umbrellaCategory: 'Check', },
  [BaseCategories.Clothing]: { umbrellaCategory: 'Clothing', },
  [BaseCategories.EatingOut]: { umbrellaCategory: 'EatingOut', },
  [BaseCategories.Fees]: { umbrellaCategory: 'Fees', },
  [BaseCategories.Gift]: { umbrellaCategory: 'Gift', },
  [BaseCategories.HomeImprovement]: { umbrellaCategory: 'HomeImprovement', },
  [BaseCategories.HomeMaintenance]: { umbrellaCategory: 'HomeMaintenance', },
  [BaseCategories.Kid]: { umbrellaCategory: 'Kid', },
  [BaseCategories.LawyerFees]: { umbrellaCategory: 'LawyerFees', },
  [BaseCategories.Medical]: { umbrellaCategory: 'Medical', },
  [BaseCategories.MetaCanada]: { umbrellaCategory: 'MetaCanada', },
  [BaseCategories.MetaStan]: { umbrellaCategory: 'MetaStan', },
  [BaseCategories.MetaOneTime]: { umbrellaCategory: 'MetaOneTime', },
  [BaseCategories.MetaFood]: { umbrellaCategory: 'MetaFood', },
  // ATM Withdrawal vs NON-CHASE ATM WITHDRAW captured by one string
  [BaseCategories.Misc]: { umbrellaCategory: 'Misc', },
  [BaseCategories.Mortgage]: { umbrellaCategory: 'Mortgage', },
  [BaseCategories.PersonalCare]: { umbrellaCategory: 'PersonalCare', },
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
export const isNotTransfer = (transaction: ITransaction) => transaction.transactionType !== TRANSACTION_TYPES.TRANSFER
export const isDebit = (transaction: ITransaction) => transaction.transactionType === TRANSACTION_TYPES.DEBIT
export const isIgnore = (transaction: ICategorizedTransaction) => transaction.category === IGNORE
export const isNotIgnore = (transaction: ICategorizedTransaction) => !isIgnore(transaction)

type CategoryValues = { [index: string]: number }
const umbrellaCategoryAcc: CategoryValues = Object.values(targetSummary).reduce((acc, next) =>
  ({ ...acc, ... { [next.umbrellaCategory]: 0 } }), {})
umbrellaCategoryAcc[UNCATEGORIZABLE] = 0

export type Summary = CategoryValues & { total: number }
export const summarize = (transactions: ICategorizedTransaction[]): Summary => {
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

/**
 * Used with ITransaction | ICategorizedTransaction inputs
 */
export const assignCategories = (t: any): ICategorizedTransaction => {
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

export const Categories = Object.keys(umbrellaCategoryAcc)