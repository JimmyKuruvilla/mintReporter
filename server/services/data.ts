import fs from 'fs';
import { initialDataFilePath, FILE_NAMES, editingFilePath } from '../config'
import { ICategorizedTransaction } from './transaction'
import { readJsonFile } from './file';

export const Read = {
  allDebits: () => readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.ALL_DEBITS)),
  allCredits: () => readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.ALL_CREDITS)),
  uncategorizableDebits: () => readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.UNCATEGORIZABLE_DEBITS))
}

export const Write = {
  categorizedDebits: (data: any) => fs.writeFileSync(editingFilePath(FILE_NAMES.CATEGORIZED_DEBITS), JSON.stringify(data))
}