import { UNCATEGORIZABLE, IGNORE } from '../../constants'
import { db } from '../../persistence/dataSource'
import { DAOMatcher, MatcherType } from '.'

const repo = () => db.getRepository(DAOMatcher)

export const categoryActions = {
  readCategoryList: async (): Promise<string[]> => {
    return repo()
      .createQueryBuilder('matcher')
      .select('DISTINCT matcher.category', 'category')
      .where('matcher.type = :type', { type: MatcherType.FINAL })
      .getRawMany<{ category: string }>()
      .then(rows => rows.map(row => row.category))
  }
}

export type ICategoryAcc = { [category: string]: number; };
export const getCategoryAcc = async () => {
  const categories = await categoryActions.readCategoryList();
  const cats: ICategoryAcc = categories.reduce((acc, categoryName) => ({ ...acc, ...{ [categoryName]: 0 } }), {});
  cats[UNCATEGORIZABLE] = 0;
  cats[IGNORE] = 0;
  return cats;
};

export const getUiCategories = async () => {
  const categories = await categoryActions.readCategoryList();
  return [...categories, UNCATEGORIZABLE, IGNORE];
};

