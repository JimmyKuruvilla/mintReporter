import { Persistence } from '..';
import { SvcMatcher } from '../../services';
import { db } from '../db';
import { MatcherDAO, MatcherType } from './matcher.dao';

const MatcherRepo = db.getRepository(MatcherDAO)

export const finalActions = {
  read: async (): Promise<SvcMatcher[]> => {
    return (await MatcherRepo.find({ where: { type: MatcherType.FINAL } })).map(m => m.toSvc())
  },
  clear: () => MatcherRepo.delete({ type: MatcherType.FINAL }),
  write: async (matchers: SvcMatcher[]) => {
    await Persistence.matchers.final.clear()
    await MatcherRepo.save(matchers.map(m => new MatcherDAO({ ...m, type: MatcherType.FINAL, id: undefined })))
  },
}

export const modifiedActions = {
  read: async (): Promise<SvcMatcher[]> => {
    return (await MatcherRepo.find({ where: { type: MatcherType.MODIFIED } })).map(m => m.toSvc())
  },
  clear: () => MatcherRepo.delete({ type: MatcherType.MODIFIED }),
  write: async (matchers: SvcMatcher[]) => {
    await Persistence.matchers.modified.clear()
    await MatcherRepo.save(matchers.map(m => new MatcherDAO({ ...m, type: MatcherType.MODIFIED, id: undefined })))
  }
}
