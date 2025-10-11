import { Persistence } from '..';
import { IMatcherDTO } from '../../services';
import { db } from '../db';
import { MatcherDAO, MatcherType } from './matcher.entity';

const MatcherRepo = db.getRepository(MatcherDAO)

export const finalActions = {
  read: async (): Promise<IMatcherDTO[]> => {
    return (await MatcherRepo.find({ where: { type: MatcherType.FINAL } })).map(m => m.toDTO())
  },
  clear: () => MatcherRepo.delete({ type: MatcherType.FINAL }),
  write: async (matchers: MatcherDAO[]) => {
    await Persistence.matchers.final.clear()
    await MatcherRepo.save(matchers.map(m => {
      m.type = MatcherType.FINAL;
      m.id = undefined
      return m
    }))
  },
}

export const modifiedActions = {
  read: async (): Promise<IMatcherDTO[]> => {
    return (await MatcherRepo.find({ where: { type: MatcherType.MODIFIED } })).map(m => m.toDTO())
  },
  clear: () => MatcherRepo.delete({ type: MatcherType.MODIFIED }),
  write: async (matchers: MatcherDAO[]) => {
    await Persistence.matchers.modified.clear()
    await MatcherRepo.save(matchers.map(m => {
      m.type = MatcherType.MODIFIED
      m.id = undefined
      return m
    }))
  }
}