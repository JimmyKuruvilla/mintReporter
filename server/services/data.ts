import fs from 'fs';
import { FILE_NAMES, csvOutputFilePath, finalMatchersFilePath, initialDataFilePath, initialDataFolder, modifiedMatchersFilePath, uploadsFolder } from '../config';
import { readJsonFile, recursiveTraverse } from './file';
import { IDbMatchers } from './matcher';
import { ICategorizedTransaction } from './transaction';

const json = (data: any) => JSON.stringify(data, null, 2)

export const List = {
  uploads: async () => fs.readdirSync(uploadsFolder)
};

export const Read = {
  finalMatchers: () =>
    readJsonFile<IDbMatchers>(finalMatchersFilePath()),
  modifiedMatchers: () =>
    readJsonFile<IDbMatchers>(modifiedMatchersFilePath()),
  allDebits: () =>
    readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.ALL_DEBITS)),
  allCredits: () =>
    readJsonFile<ICategorizedTransaction[]>(initialDataFilePath(FILE_NAMES.ALL_CREDITS))
}

export const Write = {
  finalMatchers: (data: any) =>
    fs.writeFileSync(finalMatchersFilePath(), json(data)),
  modifiedMatchers: (data: any) =>
    fs.writeFileSync(modifiedMatchersFilePath(), json(data)),
  ignoredDebits: (data: any) =>
    fs.writeFileSync(initialDataFilePath(FILE_NAMES.IGNORED_DEBITS), json(data)),
  allDebits: (data: any) =>
    fs.writeFileSync(initialDataFilePath(FILE_NAMES.ALL_DEBITS), json(data)),
  allCredits: (data: any) =>
    fs.writeFileSync(initialDataFilePath(FILE_NAMES.ALL_CREDITS), json(data)),

  outputDebits: (data: string) =>
    fs.writeFileSync(csvOutputFilePath(FILE_NAMES.ALL_DEBITS), data),
  outputCredits: (data: string) =>
    fs.writeFileSync(csvOutputFilePath(FILE_NAMES.ALL_CREDITS), data),
  outputSummary: (data: string) =>
    fs.writeFileSync(csvOutputFilePath(FILE_NAMES.SUMMARY), data)
}

export const Delete = {
  modifiedMatchers: () => fs.unlinkSync(modifiedMatchersFilePath()),
}

export const DeleteFiles = {
  initialData: () => recursiveTraverse(initialDataFolder, ['.json'], console, (path: string) => {
    fs.unlinkSync(path);
  }),
  uploads: () => recursiveTraverse(uploadsFolder, ['ALL'], console, (path: string) => {
    fs.unlinkSync(path);
  })
}

export const getIdWithoutCategory = (data: any) => `${data.date}-${data.amount}-${data.description}`

export const getFullId = (data: any) => `${getIdWithoutCategory(data)}-${data.category}`;

