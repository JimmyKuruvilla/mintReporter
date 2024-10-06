export const COMMA = ',';
export const NEW_LINE = '\n';
export const CARRIAGE_RETURN = '\r';
export const UTF8 = 'utf8';

export const IGNORE = 'ignore';
export const UNCATEGORIZABLE = 'uncategorizable';
export const CHECK = 'Check';

export const EMPTY_FIELD = ',,';
export enum TRANSACTION_TYPES {
  DEBIT = 'debit',
  CREDIT = 'credit',
  TRANSFER = 'transfer',
}
export const SUMMARY = 'summary';
export const CATEGORY = 'category';
export const csvOutputFilePath = (filename: string, ext = 'csv') => `data/outputs/${filename}.${ext}`
export const initialDataFilePath = (filename: string, ext = 'json') => `data/initial/${filename}.${ext}`
export const isTest = process.env.FILE_EXTS === '.test'