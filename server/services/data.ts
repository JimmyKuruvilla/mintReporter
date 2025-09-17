import fs from 'fs';
import { initialDataFilePath, FILE_NAMES, editingFilePath, csvOutputFilePath, modifiedMatchersFilePath, matchersFilePath } from '../config'
import { ICategorizedTransaction } from './transaction'
import { readJsonFile } from './file';
import { IDbMatchers, IInvertedDbMatchers, IUiMatcher } from './summary';

const json = (data: any) => JSON.stringify(data, null, 2)

export const Read = {
  matchers: () =>
    readJsonFile<IDbMatchers>(matchersFilePath()),
  modifiedMatchers: () =>
    readJsonFile<IDbMatchers>(modifiedMatchersFilePath()),
  allDebits: () =>
    readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.ALL_DEBITS)),
  allCredits: () =>
    readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.ALL_CREDITS)),
  uncategorizableDebits: () =>
    readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.UNCATEGORIZABLE_DEBITS)),
  editedDebits: () =>
    readJsonFile<ICategorizedTransaction[]>(editingFilePath(FILE_NAMES.EDITED_DEBITS)),
  editedCredits: () =>
    readJsonFile<ICategorizedTransaction[]>(editingFilePath(FILE_NAMES.EDITED_CREDITS)),
}

export const Write = {
  modifiedMatchers: (data: any) =>
    fs.writeFileSync(modifiedMatchersFilePath(), json(data)),
  ignoredDebits: (data: any) =>
    fs.writeFileSync(initialDataFilePath(FILE_NAMES.IGNORED_DEBITS), json(data)),
  allDebits: (data: any) =>
    fs.writeFileSync(initialDataFilePath(FILE_NAMES.ALL_DEBITS), json(data)),
  allCredits: (data: any) =>
    fs.writeFileSync(initialDataFilePath(FILE_NAMES.ALL_CREDITS), json(data)),
  uncategorizableDebits: (data: any) =>
    fs.writeFileSync(initialDataFilePath(FILE_NAMES.UNCATEGORIZABLE_DEBITS), json(data)),
  editedDebits: (data: any) =>
    fs.writeFileSync(editingFilePath(FILE_NAMES.EDITED_DEBITS), json(data)),
  editedCredits: (data: any) =>
    fs.writeFileSync(editingFilePath(FILE_NAMES.EDITED_CREDITS), json(data)),

  outputDebits: (data: string) =>
    fs.writeFileSync(csvOutputFilePath(FILE_NAMES.ALL_DEBITS), data),
  outputCredits: (data: string) =>
    fs.writeFileSync(csvOutputFilePath(FILE_NAMES.ALL_CREDITS), data),
  outputSummary: (data: string) =>
    fs.writeFileSync(csvOutputFilePath(FILE_NAMES.SUMMARY), data)
}

export const getIdWithoutCategory = (data: any) => `${data.date}-${data.amount}-${data.description}`
export const getFullId = (data: any) => `${getIdWithoutCategory(data)}-${data.category}`