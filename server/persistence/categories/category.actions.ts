import { MatcherDAO, MatcherType, } from '..';
import { db } from '../db';

const MatcherRepo = db.getRepository(MatcherDAO)

export const categoryActions = {
  readCategoryList: async (): Promise<string[]> => {
    return MatcherRepo
      .createQueryBuilder('matcher')
      .select('DISTINCT matcher.category', 'category')
      .where('matcher.type = :type', { type: MatcherType.FINAL })
      .getRawMany<{ category: string }>()
      .then(rows => rows.map(row => row.category))
  }
}

