import path from 'path';

export * from './chaseIdtoDetails'

export const FILE_NAMES = {
  CATEGORIES: {
    SUMMARY: 'base',
    MODIFIED_SUMMARY: 'base.modified'
  },
  MATCHERS: {
    FINAL: 'final',
    MODIFIED: 'modified'
  },
  ALL_DEBITS: 'debits.all',
  ALL_CREDITS: 'credits.all',
  EDITED_DEBITS: 'debits.edited',
  EDITED_CREDITS: 'credits.edited',
  SUMMARY: 'summary',
  IGNORED_DEBITS: 'debug__debits.ignored'
}

export const categoriesFolder = path.join(process.cwd(), 'server', 'categories')

export const matchersFolder = path.join(process.cwd(), 'server', 'matchers')
export const finalMatchersFilePath = () => `${path.join(matchersFolder, FILE_NAMES.MATCHERS.FINAL)}.json`
export const modifiedMatchersFilePath = () => `${path.join(matchersFolder, FILE_NAMES.MATCHERS.MODIFIED)}.json`

export const inputsFolder = path.join(process.cwd(), 'server', 'data', 'inputs')
export const uploadsFolder = path.join(process.cwd(), 'server', 'data', 'uploads');

export const initialDataFolder = path.join(process.cwd(), 'server', 'data', 'initial')
export const initialDataFilePath = (filename: string, ext = 'json') => `${path.join(initialDataFolder, filename)}.${ext}`

export const editingFolder = path.join(process.cwd(), 'server', 'data', 'editing')
export const editingFilePath = (filename: string, ext = 'json') => `${path.join(editingFolder, filename)}.${ext}`

export const csvOutputFolder = path.join(process.cwd(), 'server', 'data', 'outputs')
export const csvOutputFilePath = (filename: string, ext = 'csv') => `${path.join(csvOutputFolder, filename)}.${ext}`

export const isTest = process.env.FILE_EXTS === '.test'