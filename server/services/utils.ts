import { readdir, stat } from 'node:fs/promises'
import path from 'path'
import fs from 'fs';
import { sortBy } from 'lodash';
import { IGNORE, UNCATEGORIZABLE, NEW_LINE, CHECK } from '../constants';
import { csvOutputFilePath, categoriesFolder } from '../config'
import { CombinedSummary } from './summary';
import { ICategorizedTransaction } from './transaction';
import { readJsonFile } from './file';

export const recursiveTraverse = async (rootPath: string, allowedExtensions: string[], logger: any, operationFn: (fullPath: string) => void) => {
  const allowedExts = allowedExtensions.length === 1 && allowedExtensions[0] === 'ALL' ? [] : allowedExtensions.map(ext => ext.toLowerCase())
  const filenames = await readdir(rootPath)

  for (const filename of filenames) {
    const fullPath = path.join(rootPath, filename)
    const stats = await stat(fullPath)

    try {
      if (stats.isDirectory()) {
        await recursiveTraverse(fullPath, allowedExts, logger, operationFn)
      } else {
        if (allowedExts.length === 0) {
          await operationFn(fullPath)
        } else if (allowedExts.includes(path.extname(filename).toLowerCase())) {
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

export const writeTransactionsAsCsv = (filename: string, transactions: ICategorizedTransaction[]) => {
  const output = transactions
    .map(_ => `${_.date.toLocaleDateString()}, ${_.description.replace(/ +/g, ' ')}, ${_.amount}, ${_.category}, ${_.accountName}`)
    .join(NEW_LINE);

  fs.writeFileSync(csvOutputFilePath(filename), output)
}

export const updatePermanentQueries = async (uncategorizableDebits: ICategorizedTransaction[]) => {
  const baseSummaryJson = await readJsonFile<{ [category: string]: string }>(`${categoriesFolder}/base.json`)

  uncategorizableDebits.forEach((t => {
    if (t.permanentCategory) {
      if (!baseSummaryJson[t.permanentCategory]) {
        throw new Error(`Base Summary json does not include ${t.permanentCategory}`)
      } else {
        baseSummaryJson[t.permanentCategory] = `${t.permanentCategoryQuery}, ${baseSummaryJson[t.permanentCategory]}`
      }
    }
  }))

  fs.writeFileSync(`${categoriesFolder}/modifiedBaseForReview.json`, JSON.stringify(baseSummaryJson, null, 2))
}

export const isUncategorizable = (i: { category: string }) => i.category === UNCATEGORIZABLE || i.category === CHECK