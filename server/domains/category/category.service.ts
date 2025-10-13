import { IGNORE, UNCATEGORIZABLE } from '../../constants';
import { db } from '../../persistence/dataSource';
import { DAOMatcher } from './dao.matcher';
import { MatcherType } from './matcherType';
import { SvcMatcher, SvcMatcherCtorArgs } from './svc.matcher';

export type ICategoryAcc = { [category: string]: number; };

const repo = () => db.getRepository(DAOMatcher)

const finalClear = () => repo().delete({ type: MatcherType.FINAL })
const modifiedClear = () => repo().delete({ type: MatcherType.MODIFIED })


// TODO should take db actions as a dependency - or db as a dep
export class CategoryService {
  constructor() { }

  getUiCategories = async () => {
    const categories = await this.categoryDbActions.readCategoryList();
    return [...categories, UNCATEGORIZABLE, IGNORE];
  };

  getUiMatchers = async () => {
    const matchers = await this.getAvailableMatchers();
    return matchers.map(i => ({
      id: i.id,
      category: i.category,
      query: i.query,
      markedForDelete: false
    }));
  };

  getAvailableMatchers = async () => {
    let matchers;

    matchers = await this.modifiedMatcherDbActions.read();
    if (!matchers.length) {
      console.warn(`NO_MODIFIED_MATCHERS_USING_FINAL_MATCHERS`);
      matchers = await this.finalMatcherDbActions.read();
    }

    return matchers;
  };

  getCategoryAcc = async () => {
    const categories = await this.categoryDbActions.readCategoryList();
    const cats: ICategoryAcc = categories.reduce((acc, categoryName) => ({ ...acc, ...{ [categoryName]: 0 } }), {});
    cats[UNCATEGORIZABLE] = 0;
    cats[IGNORE] = 0;
    return cats;
  };

  createMatchers = async (matcherType: MatcherType, matchers: SvcMatcherCtorArgs[]) => {
    if (matcherType === MatcherType.FINAL) {
      await this.modifiedMatcherDbActions.clear()
      await this.finalMatcherDbActions.write(
        matchers.map((matcher: SvcMatcherCtorArgs) => new SvcMatcher({ ...matcher, type: MatcherType.EMPTY }))
      )
    } else {
      await this.modifiedMatcherDbActions.write(
        matchers.map((matcher: SvcMatcherCtorArgs) => new SvcMatcher({ ...matcher, type: MatcherType.EMPTY }))
      )
    }
  }

  deleteModifiedMatchers = async () => {
    try {
      return this.modifiedMatcherDbActions.clear()
    } catch (error) {
      console.warn(`No modified file to delete`)
    }
  }

  categoryDbActions = {
    readCategoryList: async (): Promise<string[]> => {
      return repo()
        .createQueryBuilder('matcher')
        .select('DISTINCT matcher.category', 'category')
        .where('matcher.type = :type', { type: MatcherType.FINAL })
        .getRawMany<{ category: string }>()
        .then(rows => rows.map(row => row.category))
    }
  }

  finalMatcherDbActions = {
    read: async (): Promise<SvcMatcher[]> => {
      return (await repo().find({ where: { type: MatcherType.FINAL } })).map(m => m.toSvc())
    },
    clear: finalClear,
    write: async (matchers: SvcMatcher[]) => {
      await finalClear()
      await repo().save(matchers.map(m => new DAOMatcher({ ...m, type: MatcherType.FINAL, id: undefined })))
    },
  }

  modifiedMatcherDbActions = {
    read: async (): Promise<SvcMatcher[]> => {
      return (await repo().find({ where: { type: MatcherType.MODIFIED } })).map(m => m.toSvc())
    },
    clear: modifiedClear,
    write: async (matchers: SvcMatcher[]) => {
      await modifiedClear()
      await repo().save(matchers.map(m => new DAOMatcher({ ...m, type: MatcherType.MODIFIED, id: undefined })))
    }
  }
}



const TestMatchers = {
  'has-dash': 'has dash',
  'has number sign': 'has number sign',
  'has star': 'with removed asterisk',
  'website': 'contains .com',
  'some company.com': 'website with removed asterisk',
  'some_and_company': 'ampersand replacement',
  'override-category': 'overridden category',
  'ignore-test': IGNORE,
};
