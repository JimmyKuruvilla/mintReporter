import { MatcherDAO, Persistence } from '../persistence';
import { FINAL } from '../persistence/constants';
import { Read } from '../services';

await Persistence.db.initialize()
const finalMatchers = await Read.finalMatchers()
await Persistence.matchers.final.clear()

const matchers = Object.entries(finalMatchers).flatMap(([category, queryStr]) => {
  const queries = queryStr.split(',')
  return queries.map(query => {
    return new MatcherDAO({
      category: category,
      query: query,
      type: FINAL,
      id: undefined
    })
  })
})

await Persistence.matchers.final.write(matchers)
console.log(`Cleared final matched and inserted ${matchers.length} new final matchers`)