import path from 'path';

export * from './chaseIdtoDetails'

export const FILE_NAMES = {
  MATCHERS: {
    FINAL: 'final',
  },
  CSV: {
    DEBITS: 'debits',
    CREDITS: 'credits',
    SUMMARY: 'summary'
  }
}

export const matchersFolder = path.join(process.cwd(), 'server', 'scripts', 'matchers')
export const finalMatchersFilePath = () => `${path.join(matchersFolder, FILE_NAMES.MATCHERS.FINAL)}.json`

export const csvOutputFolder = path.join(process.cwd(), 'server', 'tmp', 'outputs')
export const csvOutputFilePath = (filename: string, ext = 'csv') => `${path.join(csvOutputFolder, filename)}.${ext}`

export const uploadsFolder = path.join(process.cwd(), 'server', 'tmp', 'uploads');

export const isTest = process.env.FILE_EXTS === '.test'