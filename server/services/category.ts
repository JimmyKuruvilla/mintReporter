import { COMMA, IGNORE, UNCATEGORIZABLE } from '../constants';
import { TransactionType } from '../persistence/transaction/transaction.dao';
import { getDbMatchers, getServiceMatchers } from './matcher';
import { SvcTransaction } from './svcTransaction';

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

