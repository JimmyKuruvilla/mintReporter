import fs from 'fs';
import { initialDataFilePath, FILE_NAMES, editingFilePath } from '../config'
import { ICategorizedTransaction } from './transaction'
import { readJsonFile } from './file';

export const Read = {
  allDebits: () => readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.ALL_DEBITS)),
  allCredits: () => readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.ALL_CREDITS)),
  uncategorizableDebits: () => readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.UNCATEGORIZABLE_DEBITS)),
  editedDebits: () => readJsonFile<ICategorizedTransaction[]>(editingFilePath(FILE_NAMES.EDITED_DEBITS)),
  editedCredits: () => readJsonFile<ICategorizedTransaction[]>(editingFilePath(FILE_NAMES.EDITED_CREDITS)),
}

export const Write = {
  ignoredDebits: (data: any) => fs.writeFileSync(initialDataFilePath(FILE_NAMES.IGNORED_DEBITS), JSON.stringify(data, null, 2)),
  allDebits: (data: any) => fs.writeFileSync(initialDataFilePath(FILE_NAMES.ALL_DEBITS), JSON.stringify(data, null, 2)),
  allCredits: (data: any) => fs.writeFileSync(initialDataFilePath(FILE_NAMES.ALL_CREDITS), JSON.stringify(data, null, 2)),
  uncategorizableDebits: (data: any) => fs.writeFileSync(initialDataFilePath(FILE_NAMES.UNCATEGORIZABLE_DEBITS), JSON.stringify(data, null, 2)),
  editedDebits: (data: any) => fs.writeFileSync(editingFilePath(FILE_NAMES.EDITED_DEBITS), JSON.stringify(data, null, 2)),
  editedCredits: (data: any) => fs.writeFileSync(editingFilePath(FILE_NAMES.EDITED_CREDITS), JSON.stringify(data, null, 2))
}

export const getIdWithoutCategory = (data: any) => `${data.date}-${data.amount}-${data.description}`
export const getFullId = (data: any) => `${getIdWithoutCategory(data)}-${data.category}`