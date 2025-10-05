import 'reflect-metadata'
import { DataSource } from 'typeorm';
import { IDbMatchers } from '../services';
import { Matcher } from './entity/matcher';
import { FINAL, MODIFIED } from './constants';

// move to utils
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// move to utils

const db = new DataSource({
  type: 'better-sqlite3',
  database: "db.sqlite",
  entities: [`${__dirname}/entity/matcher.ts`],
  synchronize: true,
  logging: false
})

const MatcherRepo = db.getRepository(Matcher)

export const Persistence = {
  db,
  matchers: {
    final: {
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
    },
    modified: {
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
  }
}
