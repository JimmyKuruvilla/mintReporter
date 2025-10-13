import { CategoryService, MatcherType, SvcMatcher } from '../domains/category'
import { FileService } from '../domains/file'
import { db } from '../persistence'

await db.initialize()
const fileService = new FileService()
const categoryService =new CategoryService()
const finalMatchers = await fileService.read.finalMatchers()
await categoryService.finalMatcherDbActions.clear()

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

await categoryService.finalMatcherDbActions.write(matchers)
console.log(`Cleared final matched and inserted ${matchers.length} new final matchers`)