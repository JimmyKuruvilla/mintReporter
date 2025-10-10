import { Persistence } from '..';
import { IMatcher } from '../../services';
import { db } from '../db';
import { Matcher, MatcherType } from './matcher.entity';

const MatcherRepo = db.getRepository(Matcher)

export const finalActions = {
  read: async (): Promise<IMatcher[]> => {
    return (await MatcherRepo.find({ where: { type: MatcherType.FINAL } })).map(m => m.toDTO())
  },
  clear: () => MatcherRepo.delete({ type: MatcherType.FINAL }),
  write: async (matchers: Matcher[]) => {
    await Persistence.matchers.final.clear()
    await MatcherRepo.save(matchers.map(m => {
      m.type = MatcherType.FINAL;
      m.id = undefined
      return m
    }))
  },
}

export const modifiedActions = {
  read: async (): Promise<IMatcher[]> => {
    return (await MatcherRepo.find({ where: { type: MatcherType.MODIFIED } })).map(m => m.toDTO())
  },
  clear: () => MatcherRepo.delete({ type: MatcherType.MODIFIED }),
  write: async (matchers: Matcher[]) => {
    await Persistence.matchers.modified.clear()
    await MatcherRepo.save(matchers.map(m => {
      m.type = MatcherType.MODIFIED
      m.id = undefined
      return m
    }))
  }
}