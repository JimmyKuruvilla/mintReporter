import { readdir, stat } from 'node:fs/promises'
import path from 'path'
import fs from 'fs';
import { sortBy } from 'lodash';
import { IGNORE, UNCATEGORIZABLE, NEW_LINE, csvOutputFilePath, CHECK } from './constants';
import { CombinedSummary } from './summary';
import { CategorizedTransaction, Transaction } from './transaction';

export const recursiveTraverse = async (rootPath: string, ALLOWED_EXTENSIONS: string[], logger: any, operationFn: (fullPath: string) => void) => {
  const filenames = await readdir(rootPath)

  for (const filename of filenames) {
    const fullPath = path.join(rootPath, filename)
    const stats = await stat(fullPath)

    try {
      if (stats.isDirectory()) {
        await recursiveTraverse(fullPath, ALLOWED_EXTENSIONS, logger, operationFn)
      } else {
        if (ALLOWED_EXTENSIONS.includes(path.extname(filename))) {
          await operationFn(fullPath)
        }
      }
    } catch (error: any) {
      logger.error(error)
    }
  }
}

export const writeSummaryAsCsv = (filename: string, summary: CombinedSummary) => {
  const ignoreTotal = summary[IGNORE]
  const uncategorizableTotal = summary[UNCATEGORIZABLE]
  const cleanList = Object.fromEntries(
    Object.entries(summary)
      .filter(([key, value]) => key !== IGNORE && key !== UNCATEGORIZABLE)
  )

  const output = sortBy(Object.entries(cleanList), [([key, value]) => key])
    .concat([[IGNORE, ignoreTotal], [UNCATEGORIZABLE, uncategorizableTotal]])
    .map(([key, value]) => `${key}, ${parseFloat(value.toFixed(2))}`)
    .join(NEW_LINE);

  fs.writeFileSync(csvOutputFilePath(filename), output)
}

export const writeTransactionsAsCsv = (filename: string, transactions: CategorizedTransaction[]) => {
  const output = transactions
    .map(_ => `${_.date.toLocaleDateString()}, ${_.description.replace(/ +/g, ' ')}, ${_.amount}, ${_.category}, ${_.accountName}`)
    .join(NEW_LINE);

  fs.writeFileSync(csvOutputFilePath(filename), output)
}

export const updatePermanentQueries = async (uncategorizableDebits: CategorizedTransaction[]) => {
  const baseSummaryJson = await readJsonFile('./src/categories/base.json')

  uncategorizableDebits.forEach((t => {
    if (t.permanentCategory) {
      if (!baseSummaryJson[t.permanentCategory]) {
        throw new Error(`Base Summary json does not include ${t.permanentCategory}`)
      } else {
        baseSummaryJson[t.permanentCategory] = `${t.permanentCategoryQuery}, ${baseSummaryJson[t.permanentCategory]}`
      }
    }
  }))

  fs.writeFileSync('./src/categories/modifiedBaseForReview.json', JSON.stringify(baseSummaryJson, null, 2))
}

export const clearInitialData = async () => {
  await recursiveTraverse('data/initial', ['.json'], console, (path: string) => {
    fs.unlinkSync(path)
  })
}

export const readJsonFile = async (filepath: string) => {
  return JSON.parse(await fs.readFileSync(filepath, { encoding: 'utf8' }))
}

export const filterUncategorizable = (i: { category: string }) => i.category === UNCATEGORIZABLE || i.category === CHECK