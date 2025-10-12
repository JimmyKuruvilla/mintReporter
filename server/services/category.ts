import { IGNORE, UNCATEGORIZABLE } from '../constants';
import { Persistence } from '../persistence';

export type ICategoryAcc = { [category: string]: number; };
export const getCategoryAcc = async () => {
  const categories = await Persistence.categories.readCategoryList()
  const cats: ICategoryAcc = categories.reduce((acc, categoryName) => ({ ...acc, ...{ [categoryName]: 0 } }), {});
  cats[UNCATEGORIZABLE] = 0;
  cats[IGNORE] = 0;
  return cats;
};

export const getUiCategories = async () => {
  const categories = await Persistence.categories.readCategoryList()
  return [...categories, UNCATEGORIZABLE, IGNORE];
};
