import { IGNORE, UNCATEGORIZABLE } from '../constants';
import { Persistence } from '../persistence';

export type IUmbrellaCategoryAcc = { [umbrellaCategory: string]: number; };
export const getUmbrellaCategoryAcc = async () => {
  const categories = await Persistence.categories.readCategoryList()
  const cats: IUmbrellaCategoryAcc = categories.reduce((acc, categoryName) => ({ ...acc, ...{ [categoryName]: 0 } }), {});
  cats[UNCATEGORIZABLE] = 0;
  cats[IGNORE] = 0;
  return cats;
};

export const getUiUmbrellaCategories = async () => {
  const categories = await Persistence.categories.readCategoryList()
  return [...categories, UNCATEGORIZABLE, IGNORE];
};
