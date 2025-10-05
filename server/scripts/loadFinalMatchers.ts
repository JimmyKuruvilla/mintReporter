import 'reflect-metadata'
import { Matcher, Persistence } from '../persistence';
import { FINAL } from '../persistence/constants';
import { Read } from '../services';

await Persistence.db.initialize()
const finalMatchers = await Read.finalMatchers()

const matchers = Object.entries(finalMatchers).flatMap(([category, queryStr]) => {
  const queries = queryStr.split(',')
  return queries.map(query => {
    return new Matcher({
      category: category,
      query: query,
      type: FINAL,
      id: undefined
    })
  })
})

await Persistence.matchers.final.write(matchers)
console.log(`Inserted ${matchers.length} final matchers`)