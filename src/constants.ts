export const COMMA = ',';
export const NEW_LINE = '\n';
export const CARRIAGE_RETURN = '\r';
export const UTF8 = 'utf8';
export const IGNORE = 'ignore';
export const EMPTY_FIELD = ',,';
export enum TRANSACTION_TYPES {
  DEBIT = 'debit',
  CREDIT = 'credit',
  TRANSFER = 'transfer',
}
export const SUMMARY = 'summary';
export const CATEGORY = 'category';
export const outputFilePath = (filename: string) => `csvs/outputs/${filename}.csv`
export const isTest = process.env.FILE_EXTS === '.test'