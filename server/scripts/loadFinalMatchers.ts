import { MatcherType, SvcMatcher } from '../domains/category'
import { db, Persistence } from '../persistence'

await db.initialize()
const finalMatchers = await Persistence.file.read.finalMatchers()
await Persistence.matchers.final.clear()

const matchers = Object.entries(finalMatchers).flatMap(([category, queryStr]) => {
  const queries = queryStr.split(',')
  return queries.map(query => {
    return new SvcMatcher({
      category: category,
      query: query,
      type: MatcherType.FINAL,
      id: undefined
    })
  })
})

await Persistence.matchers.final.write(matchers)
console.log(`Cleared final matched and inserted ${matchers.length} new final matchers`)