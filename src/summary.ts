import { COMMA, IGNORE, TRANSACTION_TYPES, isTest } from './constants';
import { CostaRica } from './descriptions/costaRica062024';
import { Transaction } from './transaction';

const Amusements = "prime video channels, steam games, MORTONARB, Audible, AMAZON PRIME, TONYA RAE"
const Auto = "Reber, shell oil, COSTCO GAS, o'reilly, ILLINOISSECRETARYOFSTATE, IL TOLLWAY-AUTOREPLENISH, BP#, uber trip, ILSOS"
const Education = "udemy, codecademy, WWW.KHANACADEMY.ORG, THRIFT BOOKS, COLLEGEBOARD"
const Emergency = "onlyemergencyonetimes"
const Charity = "WBEZ Chi Pub Media, NOILFOODBANK, wikipedia,girl scouts"
const Check = "check"
const Clothing = "zappos, JJ CLEANERS, nike, OLD NAVY, GAP"
const EatingOut = "deli, chick-fil-a, all chocolate kitchen, 7-eleven, dd/br, los cantaritos, loscantaritos, taqueria el sazon, mcdonald, starbucks, egg harbor, panera, indian harvest, panda express, first watch, penrose brewing, copper fox, duck donuts, DUNKIN, OBERWEIS, french 75, TELUGURUCHULU, ART HISTORY BREWING, geneva ale house, irish pub, thai corner cuisine, graham's, BATAVIA CREAMERY, DEAR DONUTS, SWEETSTOP, taylor st. pizza, OBSCURITY BREWING, SCHMIDTS TOWNE TAP, BATAVIA SMOKE N LIQUOR, THE SOUTHERN CAFE, ETHIO BEANS, MANCHU WOK, CHEZ GASTON, GROVE ORD, TIE ORDER, JAMBA, Hardware Restaurant, WENDY'S"
const Fees = "safe deposit"
const Gift = "paramount arts center, party city, sarkis pastry"
const HomeImprovement = "menards, jc licht, sp igworks, lowes, home depot, at home store, benjamin moore, SAMPLIZE, STENCILREVOLUTION, thrift _and_ dollar, sherwin williams, toto fabrics, vikingsewinggallery, VIKINGSEWINGGALLERY657, DECORATIVE FABRICS DIRECT, HEINZ BROTHERS, HOMEDEPOT.COM, HARBOR FREIGHT"
const HomeMaintenance = "Home Maintenance"
const Kid = "music_and_arts.com, sounds like music, genevapark, county of kane school, PTO, VSI GENEVAPARKDISTIB, GENEVAPARKDISTWEB"
const LawyerFees = "Lawyer Fees"
const Medical = "REMOTE ONLINE DEPOSIT, khanna, caremark, alliance clinical,riverview counseling, prose orthodontics, lawrence l johnson, cvs/pharmacy, atkinsons _and_ associates, northwestern my chart, PERIODONTAL MEDICINE PR, IN STEP BEHAVIORAL, JOHNSON DERMATOLOGY"
const MetaCanada = "Meta Canada"
const MetaStan = "Meta Stan"
const MetaOneTime = "Meta Onetime"
const MetaFood = "meijer, fresh thyme, THE FRESH MARKET, trader joe, aldi, jewel, COSTCO WHSE, caputo's, caputos, arbico organics"
// ATM Withdrawal vs NON-CHASE ATM WITHDRAW captured by one string
const Misc = "ATM Withdraw, ATM WITHDRAWAL, Zelle" 
const Mortgage = "mortgage"
const PersonalCare = "colour line, os2 salon, HARE_and_COMB, OMNILUX, ULTA"
const Pet = "meadowview, petsmart, MEADOWVIEWVET.COM"
const Shopping = "great estate, homegoods, AMZN Mktp, Amazon.com, etsy, joann stores, fabric wholesale, wal-mart, Michaels, blueland, goodwill retail, josh's frogs, BED BATH _AND_ BEYOND, target, walgreens, WORLD MARKET, WWW COSTCO COM, CASEYS, ONEHOMEBRAN, AMAZON MKTPL"
const Utilities = "patreon, netflix.com, chatgpt subscription, OPENAI, google storage, STATE FARM INSURANCE, disney plus, lakeshore recycling, metronet, ting, bitwarden, youtubepremium, lincoln natlife, Lincoln Nationa, nicor, geneva IL utility,GENEVA IL  UTILITY, Amazon web services, joanna pociecha, DelightRoom, Delight Room, garden my home, DAVEY TREE EXPERT COMPANY, PAYPAL  MICROSOFT, NordVPN" // delight room is alarmy
const Vacation = `${CostaRica}, Vacation, AMERICAN, AIRBNB, Vrbo, EXPEDIA, FOREIGN TRANSACTION FEE, FOREIGN EXCHANGE RATE ADJUSTMENT FEE`

/*
  WW CCD is reimbursement and should be zeroed with some purchase, so tagged for manual changes
  WW PPD is salary and FSAs and should be counted as income
  - CCD is ignored, use an override to ignore a particular purchase so that it will be left out of totals.

  College Savings ACH is a bank ACH_DEBIT and not a transfer-type, but ignored here because it is just moving money to college funds, not actually an expense that was incurred
*/
const Ignore = "WW INTERNATIONAL PAYMENT CCD, College Savings ACH, peloton"

const categorySummary =
{
  [Amusements]: { umbrellaCategory: "Amusements", },
  [Auto]: { umbrellaCategory: "Auto & Transport", },
  [Education]: { umbrellaCategory: "Education", },
  [Emergency]: { umbrellaCategory: "Emergency", },
  [Charity]: { umbrellaCategory: "Charity", },
  [Check]: { umbrellaCategory: "Check", },
  [Clothing]: { umbrellaCategory: "Clothing", },
  [EatingOut]: { umbrellaCategory: "Eating Out", },
  [Fees]: { umbrellaCategory: "Fees", },
  [Gift]: { umbrellaCategory: "Gift", },
  [HomeImprovement]: { umbrellaCategory: "Home Improvement", },
  [HomeMaintenance]: { umbrellaCategory: "Home Maintenance", },
  [Kid]: { umbrellaCategory: "Kid", },
  [LawyerFees]: { umbrellaCategory: "Lawyer Fees", },
  [Medical]: { umbrellaCategory: "Medical", },
  [MetaCanada]: { umbrellaCategory: "Meta Canada", },
  [MetaStan]: { umbrellaCategory: "Meta Stan", },
  [MetaOneTime]: { umbrellaCategory: "Meta OneTime", },
  [MetaFood]: { umbrellaCategory: "Meta Food", },
  [Misc]: { umbrellaCategory: "Misc", },
  [Mortgage]: { umbrellaCategory: "Mortgage & Rent", },
  [PersonalCare]: { umbrellaCategory: "Personal Care", },
  [Pet]: { umbrellaCategory: "Pet", },
  [Shopping]: { umbrellaCategory: "Shopping", },
  [Utilities]: { umbrellaCategory: "Utilities", },
  [Vacation]: { umbrellaCategory: "Vacation", },
  [Ignore]: { umbrellaCategory: IGNORE, }
}

const testSummary = {
  "has-dash": { umbrellaCategory: "has dash", },
  "has number sign": { umbrellaCategory: "has number sign", },
  "has star": { umbrellaCategory: "with removed asterisk", },
  "website": { umbrellaCategory: "contains .com", },
  "some company.com": { umbrellaCategory: "website with removed asterisk", },
  "some_and_company": { umbrellaCategory: "ampersand replacement", },
  "override-category": { umbrellaCategory: "overridden category", },
  "ignore-test": { umbrellaCategory: IGNORE, }
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

// overrideCategory must be exactly as it is in the summary
export const assignCategory = (t: Transaction): Transaction => {
  if (t.metadata?.overrideCategory) {
    t.category = t.metadata.overrideCategory
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