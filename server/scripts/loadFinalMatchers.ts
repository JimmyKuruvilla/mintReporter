import { CategoryService, DAOMatcher, MatcherType, SvcMatcher } from '../domains/category'
import { FileService } from '../domains/file'
import { db } from '../persistence'

await db.initialize()
const fileService = new FileService()
const categoryService = new CategoryService({ repository: db.getRepository(DAOMatcher) })
const finalMatchers = await fileService.read.finalMatchers()
await categoryService.db.final.clear()

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

await categoryService.db.final.write(matchers)
console.log(`Cleared final matched and inserted ${matchers.length} new final matchers`)