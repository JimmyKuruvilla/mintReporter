import { db } from '../../persistence/dataSource'
import { DAOMatcher } from './dao.matcher'
import { MatcherType } from './matcherType'
import { SvcMatcher } from './svc.matcher'

const repo = () => db.getRepository(DAOMatcher)

const finalClear = () => repo().delete({ type: MatcherType.FINAL })
export const finalActions = {
  read: async (): Promise<SvcMatcher[]> => {
    return (await repo().find({ where: { type: MatcherType.FINAL } })).map(m => m.toSvc())
  },
  clear: finalClear,
  write: async (matchers: SvcMatcher[]) => {
    await finalClear()
    await repo().save(matchers.map(m => new DAOMatcher({ ...m, type: MatcherType.FINAL, id: undefined })))
  },
}

const modifiedClear = () => repo().delete({ type: MatcherType.MODIFIED })
export const modifiedActions = {
  read: async (): Promise<SvcMatcher[]> => {
    return (await repo().find({ where: { type: MatcherType.MODIFIED } })).map(m => m.toSvc())
  },
  clear: modifiedClear,
  write: async (matchers: SvcMatcher[]) => {
    await modifiedClear()
    await repo().save(matchers.map(m => new DAOMatcher({ ...m, type: MatcherType.MODIFIED, id: undefined })))
  }
}
