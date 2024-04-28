import { COMMA, IGNORE, TRANSACTION_TYPES, isTest } from './constants';
import { Transaction } from './transaction';

const testSummary = {
  "has-dash": {
    umbrellaCategory: "has dash",
  },
  "has number sign": {
    umbrellaCategory: "has number sign",
  },
  "has star": {
    umbrellaCategory: "with removed asterisk",
  },
  "website": {
    umbrellaCategory: "contains .com",
  },
  "some company.com": {
    umbrellaCategory: "website with removed asterisk",
  },
  "some_and_company": {
    umbrellaCategory: "ampersand replacement",
  },
  "override-category": {
    umbrellaCategory: "overridden category",
  },
    "ignore-test": {
    umbrellaCategory: IGNORE,
  }
}

const categorySummary =
{
  "prime video channels, steam games": {
    umbrellaCategory: "Amusements",
  },
  "Reber, shell oil, COSTCO GAS, o'reilly, ILLINOISSECRETARYOFSTATE, IL TOLLWAY-AUTOREPLENISH, BP#, uber trip": {
    umbrellaCategory: "Auto & Transport",
  },
  "udemy, codecademy": {
    umbrellaCategory: "Education",
  },
  "onlyemergencyonetimes": {
    umbrellaCategory: "Emergency",
  },
  "WBEZ Chi Pub Media, NOILFOODBANK, wikipedia,girl scouts": {
    umbrellaCategory: "Charity",
  },
  "check": {
    umbrellaCategory: "Check",
  },
  "zappos, JJ CLEANERS": {
    umbrellaCategory: "Clothing",
  },
  "deli, chick-fil-a, all chocolate kitchen, 7-eleven, dd/br, los cantaritos, loscantaritos, taqueria el sazon, mcdonald, starbucks, egg harbor, panera, indian harvest, panda express, first watch, penrose brewing, copper fox, duck donuts, OBERWEIS, french 75, TELUGURUCHULU, ART HISTORY BREWING, geneva ale house": {
    umbrellaCategory: "Eating Out",
  },
  "safe deposit": {
    umbrellaCategory: "Fees",
  },
  "paramount arts center, party city, sarkis pastry": {
    umbrellaCategory: "Gift",
  },
  "menards, jc licht, sp igworks, lowes, home depot, at home store, benjamin moore, SAMPLIZE, STENCILREVOLUTION, thrift _and_ dollar, sherwin williams, toto fabrics": {
    umbrellaCategory: "Home Improvement",
  },
  "Home Maintenance": {
    umbrellaCategory: "Home Maintenance",
  },
  "music_and_arts.com, sounds like music, genevapark, county of kane school, PTO, VSI GENEVAPARKDISTIB": {
    umbrellaCategory: "Kid",
  },
  "Lawyer Fees": {
    umbrellaCategory: "Lawyer Fees",
  },
  "REMOTE ONLINE DEPOSIT, khanna, caremark, alliance clinical,riverview counseling, prose orthodontics, lawrence l johnson, cvs/pharmacy, atkinsons _and_ associates, northwestern my chart, PERIODONTAL MEDICINE PR, IN STEP BEHAVIORAL": {
    umbrellaCategory: "Medical",
  },
  "Meta Canada": {
    umbrellaCategory: "Meta Canada",
  },
  "Meta Stan": {
    umbrellaCategory: "Meta Stan",
  },
  "Meta Onetime": {
    umbrellaCategory: "Meta OneTime",
  },
  "meijer, fresh thyme, trader joe, aldi, jewel, COSTCO WHSE, caputo's, caputos, arbico organics": {
    umbrellaCategory: "Meta Food",
  },
  // ATM Withdrawal vs NON-CHASE ATM WITHDRAW caputured by one string
  "ATM Withdraw": {
    umbrellaCategory: "Misc",
  },
  "mortgage": {
    umbrellaCategory: "Mortgage & Rent",
  },
  "colour line, os2 salon": {
    umbrellaCategory: "Personal Care",
  },
  "meadowview, petsmart": {
    umbrellaCategory: "Pet",
  },
  "great estate, homegoods, AMZN Mktp, Amazon.com, etsy, joann stores, fabric wholesale, wal-mart, Michaels stores, blueland, goodwill retail, josh's frogs, BED BATH _AND_ BEYOND, target, walgreens": {
    umbrellaCategory: "Shopping",
  },
  // delight room is alarmy
  "patreon, netflix.com, chatgpt subscription, google storage, STATE FARM INSURANCE, disney plus, lakeshore recycling, metronet, ting, bitwarden, youtubepremium, lincoln natlife, nicor, geneva IL utility, Amazon web services, joanna pociecha, DelightRoom": {
    umbrellaCategory: "Utilities",
  },
  "Vacation": {
    umbrellaCategory: "Vacation",
  },
  /*
    WW CCD is reimbursement and should be zeroed with some purchase, so tagged for manual changes
    WW PPD is salary and FSAs and should be counted as income
    - CCD is ignored, use an override to ignore a particular purchase so that it will be left out of totals.

    College Savings ACH is a bank ACH_DEBIT and not a transfer-type, but ignored here because it is just moving money to college funds, not actually an expense that was incurred
  */
  "WW INTERNATIONAL PAYMENT CCD, College Savings ACH, peloton": {
    umbrellaCategory: IGNORE,
  }
}

const targetSummary = isTest ? testSummary : categorySummary
export const isNotTransfer = (transaction: Transaction) => transaction.transactionType !== TRANSACTION_TYPES.TRANSFER
export const isNotIgnore = (transaction: Transaction) => transaction.category !== IGNORE

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

export type Bucket = { fragments: string[], categoryData: { umbrellaCategory: string } }
export const buckets: Bucket[] = Object.entries(targetSummary)
  .map(([namespace, data]) =>
  ({
    fragments: namespace.toLowerCase().split(COMMA).map(fragment => fragment.trim()).filter(Boolean),
    categoryData: data
  }))

export type CategoryValues = { [index: string]: number }
export const umbrellasToZeroTotalMap: CategoryValues = Object.values(targetSummary).reduce((acc, next) =>
  ({ ...acc, ...(next.umbrellaCategory === IGNORE ? {} : { [next.umbrellaCategory]: 0 }) }), {})

export const assignCategory = (t: Transaction): Transaction => {
  if (t.metadata?.overrideCategory) {
    t.category = t.metadata.overrideCategory.toLowerCase()
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

  return t;
}