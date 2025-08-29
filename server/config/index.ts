import path from 'path';

export * from './chaseIdtoDetails'

export const categoriesFolder = path.join(process.cwd(), 'server', 'categories')

export const inputsFolder = path.join(process.cwd(), 'server', 'data', 'inputs')

export const csvOutputFolder = path.join(process.cwd(), 'server', 'data', 'outputs')
export const csvOutputFilePath = (filename: string, ext = 'csv') => `${path.join(csvOutputFolder, filename)}.${ext}`

export const initialDataFolder = path.join(process.cwd(), 'server', 'data', 'initial')
export const initialDataFilePath = (filename: string, ext = 'json') => `${path.join(initialDataFolder, filename)}.${ext}`

export const uploadsFolder = path.join(process.cwd(), 'server', 'data', 'uploads');

export const isTest = process.env.FILE_EXTS === '.test'