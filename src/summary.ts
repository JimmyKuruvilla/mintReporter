import { partition } from 'lodash';
import { IGNORE } from './constants';
import { Transaction } from './csv';

// Keys cannot overlap, otherwise rewrites will not work correctly
export const categorySummary =
{
  "Amusement,Entertainment,Books,Games,Movies & DVDs,Alcohol & Bars,Hobbies": {
    value: 0,
    umbrellaCategory: "Amusements",
  },
  "Gas & Fuel,Service & Parts,Car Wash,Parking": {
    value: 0,
    umbrellaCategory: "Auto & Transport",
  },
  "Books": {
    value: 0,
    umbrellaCategory: "Books",
  },
  "Charity": {
    value: 0,
    umbrellaCategory: "Charity",
  },
  "Check": {
    value: 0,
    umbrellaCategory: "Check",
  },
  "Clothing, Laundry": {
    value: 0,
    umbrellaCategory: "Clothing",
  },
  "Fast Food,Restaurants,Food & Dining,Coffee Shops": {
    value: 0,
    umbrellaCategory: "Eating Out",
  },
  "Emergency": {
    value: 0,
    umbrellaCategory: "Emergency",
  },
  "Bank Fee": {
    value: 0,
    umbrellaCategory: "Fees",
  },
  "Gift,Gifts & Donations,Birthday": {
    value: 0,
    umbrellaCategory: "Gift",
  },
  "Lawn & Garden,Furnishings,Home Services": {
    value: 0,
    umbrellaCategory: "Home Improvement",
  },
  "Home Maintenance": {
    value: 0,
    umbrellaCategory: "Home Maintenance",
  },
  "Education,Kid Activities,Kids Activities,Kid Supplies,Books & Supplies, Kids": {
    value: 0,
    umbrellaCategory: "Kid",
  },
  "Lawyer Fees": {
    value: 0,
    umbrellaCategory: "Lawyer Fees",
  },
  "Doctor,Dentist,Pharmacy,Eyecare,Medical Reimbursement,Health Equipment,Counseling": {
    value: 0,
    umbrellaCategory: "Medical",
  },
  "Meta Canada": {
    value: 0,
    umbrellaCategory: "Meta Canada",
  },
  "Meta Stan": {
    value: 0,
    umbrellaCategory: "Meta Stan",
  },
  "Meta OneTime": {
    value: 0,
    umbrellaCategory: "Meta OneTime",
  },
  "Groceries": {
    value: 0,
    umbrellaCategory: "Meta Food",
  },
  "Cash & ATM,ATM Fee,Business Services,Printing,Shipping,Fees & Charges,Late Fee,Service Fee": {
    value: 0,
    umbrellaCategory: "Misc",
  },
  "Mortgage & Rent": {
    value: 0,
    umbrellaCategory: "Mortgage & Rent",
  },
  "Hair,Spa & Massage,Health & Fitness, Gym": {
    value: 0,
    umbrellaCategory: "Personal Care",
  },
  "Vet,Veterinary,Boarding,Pet Food & Supplies,Pet Grooming, Pets": {
    value: 0,
    umbrellaCategory: "Pet",
  },
  "Amazon Purchases,Electronics & Software": {
    value: 0,
    umbrellaCategory: "Shopping",
  },
  "Intuit,Meta Insurance,Mobile Phone,Taxes": {
    value: 0,
    umbrellaCategory: "Utilities",
  },
  "Vacation, Breckenridge 2022,Atlanta 2023": {
    value: 0,
    umbrellaCategory: "Vacation",
  },
  "Work,Transfer": {
    value: 0,
    umbrellaCategory: "IGNORE",
  }
}

export type Summary = CategoryValues & { total: number }
export const summarize = (transactions: Transaction[]): Summary => {
  const summarizedTransactions = transactions.reduce((acc, t) => {
    const currentValue = acc[t.category] ?? 0;
    return { ...acc, ...({ [t.category]: currentValue + t.amount }) }
  }, umbrellasToZeroTotalMap);

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

export const rewriteCategories = (transactions: Transaction[]) => {
  const unchangedCategories: { [index: string]: Transaction[] } = {}

  const rewrittenTransactions = transactions.map(t => {
    if (umbrellaCategories.includes(t.category.toLowerCase())) {
      return t
    } else {
      const matchingEntry = namespaces.find(
        ([namespaceArr, value]) =>
          namespaceArr.includes(t.category.toLowerCase())
      )

      if (matchingEntry) {
        t.category = matchingEntry[1].umbrellaCategory;
      } else {
        if (unchangedCategories[t.category]) {
          unchangedCategories[t.category].push(t)
        } else {
          unchangedCategories[t.category] = [t]
        }
      }
      return t;
    }
  })

  const [ignored, notIgnored] = partition(rewrittenTransactions, ['category', IGNORE])
  return { notIgnored, ignored, unchangedCategories, };
}

export const umbrellaCategories = Object.values(categorySummary).map(value => value.umbrellaCategory.toLowerCase())

export type Namespace = [string[], { value: number, umbrellaCategory: string }]
export const namespaces: Namespace[] = Object
  .entries(categorySummary)
  .map(([namespaceStr, value]) =>
    ([namespaceStr.toLowerCase().split(',').map(category => category.trim()), value]))

export type CategoryValues = { [index: string]: number }
export const umbrellasToZeroTotalMap: CategoryValues = Object.values(categorySummary).reduce((acc, next) =>
  ({ ...acc, ...(next.umbrellaCategory === IGNORE ? {} : { [next.umbrellaCategory]: 0 }) }), {})
