import { COMMA, IGNORE, UNCATEGORIZABLE } from '../constants';
import { TransactionType } from '../persistence/transaction/transaction.entity';
import { getDbMatchers, getServiceMatchers } from './matcher';
import { ICategorizedTransaction } from './transaction';

export type IUmbrellaCategoryAcc = { [umbrellaCategory: string]: number; };
export const getUmbrellaCategoryAcc = async () => {
  const matchers = await getServiceMatchers();
  const cats: IUmbrellaCategoryAcc = Object.values(matchers).reduce((acc, next) => ({ ...acc, ...{ [next.umbrellaCategory]: 0 } }), {});
  cats[UNCATEGORIZABLE] = 0;
  cats[IGNORE] = 0;
  return cats;
};

export const getUmbrellaCategories = async () => {
  const matchers = await getDbMatchers();
  return Object.keys(matchers);
};

export const getUiUmbrellaCategories = async () => {
  return [...(await getUmbrellaCategories()), UNCATEGORIZABLE, IGNORE];
};

export type ICategoryBucket = { fragments: string[]; categoryData: { umbrellaCategory: string; }; };
export const getCategoryBuckets: () => Promise<ICategoryBucket[]> = async () => {
  const matchers = await getServiceMatchers();
  return Object.entries(matchers)
    .map(([csvQueries, data]) => ({
      fragments: csvQueries.toLowerCase().split(COMMA).map(fragment => fragment.trim()).filter(Boolean),
      categoryData: data
    }));
};

/**
 * Used with ITransaction | ICategorizedTransaction inputs
 */
export const assignCategories = (buckets: ICategoryBucket[]) => (t: any): ICategorizedTransaction => {
  for (const bucket of buckets) {
    const { fragments, categoryData } = bucket;

    for (const fragment of fragments) {
      const match = new RegExp(`\\b${fragment}\\b`, 'i').test(t.description);

      if (match) {
        t.category = categoryData.umbrellaCategory;
        break;
      }
    }

    if (t.category) {
      break;
    }
  }

  if (!t.category) {
    t.category = t.transactionType === TransactionType.DEBIT ? UNCATEGORIZABLE : IGNORE;
  }

  return t;
};

