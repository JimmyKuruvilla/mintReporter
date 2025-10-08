import { Persistence } from '..';
import { FINAL, MODIFIED } from '../constants';
import { db } from '../db';
import { Matcher } from './matcher.entity';

const MatcherRepo = db.getRepository(Matcher)

export const finalActions = {
  read: () => MatcherRepo.find({ where: { type: FINAL } }),
  clear: () => MatcherRepo.delete({ type: FINAL }),
  write: async (matchers: Matcher[]) => {
    await Persistence.matchers.final.clear()
    await MatcherRepo.save(matchers.map(m => {
      m.type = FINAL;
      m.id = undefined
      return m
    }))
  },
}

export const modifiedActions = {
  read: () => MatcherRepo.find({ where: { type: MODIFIED } }),
  clear: () => MatcherRepo.delete({ type: MODIFIED }),
  write: async (matchers: Matcher[]) => {
    await Persistence.matchers.modified.clear()
    await MatcherRepo.save(matchers.map(m => {
      m.type = MODIFIED
      m.id = undefined
      return m
    }))
  }
}