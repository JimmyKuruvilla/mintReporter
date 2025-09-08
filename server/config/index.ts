import path from 'path';

export * from './chaseIdtoDetails'

export const FILE_NAMES = {
  ALL_DEBITS: 'debits.all',
  ALL_CREDITS: 'credits.all',
  EDITED_DEBITS: 'debits.edited',
  EDITED_CREDITS: 'credits.edited',
  SUMMARY: 'summary',
  UNCATEGORIZABLE_DEBITS: 'debug__debits.uncategorizable',
  IGNORED_DEBITS: 'debug__debits.ignored'
}

export const categoriesFolder = path.join(process.cwd(), 'server', 'categories')

export const inputsFolder = path.join(process.cwd(), 'server', 'data', 'inputs')
export const uploadsFolder = path.join(process.cwd(), 'server', 'data', 'uploads');

export const initialDataFolder = path.join(process.cwd(), 'server', 'data', 'initial')
export const initialDataFilePath = (filename: string, ext = 'json') => `${path.join(initialDataFolder, filename)}.${ext}`

export const editingFolder = path.join(process.cwd(), 'server', 'data', 'editing')
export const editingFilePath = (filename: string, ext = 'json') => `${path.join(editingFolder, filename)}.${ext}`

export const csvOutputFolder = path.join(process.cwd(), 'server', 'data', 'outputs')
export const csvOutputFilePath = (filename: string, ext = 'csv') => `${path.join(csvOutputFolder, filename)}.${ext}`

export const isTest = process.env.FILE_EXTS === '.test'