import { Repository } from 'typeorm';
import { IGNORE, UNCATEGORIZABLE } from '../../constants';
import { db } from '../../persistence/dataSource';
import { DAOMatcher } from './dao.matcher';
import { MatcherType } from './matcherType';
import { SvcMatcher, SvcMatcherCtorArgs } from './svc.matcher';

export type ICategoryAcc = { [category: string]: number; };

const finalClear = () => db.getRepository(DAOMatcher).delete({ type: MatcherType.FINAL })
const modifiedClear = () => db.getRepository(DAOMatcher).delete({ type: MatcherType.MODIFIED })

export class CategoryService {
  repository!: Repository<DAOMatcher>

  constructor(data: { repository: Repository<DAOMatcher> }) {
    Object.assign(this, data)
  }

  getUiCategories = async () => {
    const categories = await this.db.category.readCategoryList();
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

    matchers = await this.db.modified.read();
    if (!matchers.length) {
      console.warn(`NO_MODIFIED_MATCHERS_USING_FINAL_MATCHERS`);
      matchers = await this.db.final.read();
    }

    return matchers;
  };

  getCategoryAcc = async () => {
    const categories = await this.db.category.readCategoryList();
    const cats: ICategoryAcc = categories.reduce((acc, categoryName) => ({ ...acc, ...{ [categoryName]: 0 } }), {});
    cats[UNCATEGORIZABLE] = 0;
    cats[IGNORE] = 0;
    return cats;
  };

  createMatchers = async (matcherType: MatcherType, matchers: SvcMatcherCtorArgs[]) => {
    if (matcherType === MatcherType.FINAL) {
      await this.db.modified.clear()
      await this.db.final.write(
        matchers.map((matcher: SvcMatcherCtorArgs) => new SvcMatcher({ ...matcher, type: MatcherType.EMPTY }))
      )
    } else {
      await this.db.modified.write(
        matchers.map((matcher: SvcMatcherCtorArgs) => new SvcMatcher({ ...matcher, type: MatcherType.EMPTY }))
      )
    }
  }

  deleteModifiedMatchers = async () => {
    try {
      return this.db.modified.clear()
    } catch (error) {
      console.warn(`No modified file to delete`)
    }
  }

  db = {
    final: {
      read: async (): Promise<SvcMatcher[]> => {
        return (await this.repository.find({ where: { type: MatcherType.FINAL } })).map(m => m.toSvc())
      },
      clear: finalClear,
      write: async (matchers: SvcMatcher[]) => {
        await finalClear()
        await this.repository.save(matchers.map(m => new DAOMatcher({ ...m, type: MatcherType.FINAL, id: undefined })))
      },
    },
    modified: {
      read: async (): Promise<SvcMatcher[]> => {
        return (await this.repository.find({ where: { type: MatcherType.MODIFIED } })).map(m => m.toSvc())
      },
      clear: modifiedClear,
      write: async (matchers: SvcMatcher[]) => {
        await modifiedClear()
        await this.repository.save(matchers.map(m => new DAOMatcher({ ...m, type: MatcherType.MODIFIED, id: undefined })))
      }
    },
    category: {
      readCategoryList: async (): Promise<string[]> => {
        return this.repository
          .createQueryBuilder('matcher')
          .select('DISTINCT matcher.category', 'category')
          .where('matcher.type = :type', { type: MatcherType.FINAL })
          .getRawMany<{ category: string }>()
          .then(rows => rows.map(row => row.category))
      }
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
