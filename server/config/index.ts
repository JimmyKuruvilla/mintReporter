import path from 'path';

export * from './chaseIdtoDetails'

export const FILE_NAMES = {
  CATEGORIES: {
    SUMMARY: 'base',
    MODIFIED_SUMMARY: 'base.modified'
  },
  ALL_DEBITS: 'debits.all',
  ALL_CREDITS: 'credits.all',
  EDITED_DEBITS: 'debits.edited',
  EDITED_CREDITS: 'credits.edited',
  SUMMARY: 'summary',
  UNCATEGORIZABLE_DEBITS: 'debug__debits.uncategorizable',
  IGNORED_DEBITS: 'debug__debits.ignored'
}

// rename this to matchers from categories
export const categoriesFolder = path.join(process.cwd(), 'server', 'categories')
export const matchersFilePath = () => `${path.join(categoriesFolder, FILE_NAMES.CATEGORIES.SUMMARY)}.json`
export const modifiedMatchersFilePath = () => `${path.join(categoriesFolder, FILE_NAMES.CATEGORIES.MODIFIED_SUMMARY)}.json`

export const inputsFolder = path.join(process.cwd(), 'server', 'data', 'inputs')
export const uploadsFolder = path.join(process.cwd(), 'server', 'data', 'uploads');

export const initialDataFolder = path.join(process.cwd(), 'server', 'data', 'initial')
export const initialDataFilePath = (filename: string, ext = 'json') => `${path.join(initialDataFolder, filename)}.${ext}`

export const editingFolder = path.join(process.cwd(), 'server', 'data', 'editing')
export const editingFilePath = (filename: string, ext = 'json') => `${path.join(editingFolder, filename)}.${ext}`

export const csvOutputFolder = path.join(process.cwd(), 'server', 'data', 'outputs')
export const csvOutputFilePath = (filename: string, ext = 'csv') => `${path.join(csvOutputFolder, filename)}.${ext}`

export const isTest = process.env.FILE_EXTS === '.test'