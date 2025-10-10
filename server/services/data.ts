import fs from 'fs';
import { FILE_NAMES, csvOutputFilePath, finalMatchersFilePath, initialDataFilePath, initialDataFolder, modifiedMatchersFilePath, uploadsFolder } from '../config';
import { readJsonFile, recursiveTraverse } from './file';
import { IDbMatchers } from './matcher';
import { ICategorizedTransactionDTO } from './transaction';

const json = (data: any) => JSON.stringify(data, null, 2)

export const List = {
  uploads: async () => fs.readdirSync(uploadsFolder)
};

export const Read = {
  finalMatchers: () =>
    readJsonFile<IDbMatchers>(finalMatchersFilePath()),
  modifiedMatchers: () =>
    readJsonFile<IDbMatchers>(modifiedMatchersFilePath()),
}

export const Write = {
  finalMatchers: (data: any) =>
    fs.writeFileSync(finalMatchersFilePath(), json(data)),
  modifiedMatchers: (data: any) =>
    fs.writeFileSync(modifiedMatchersFilePath(), json(data)),

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
  uploads: () => recursiveTraverse(uploadsFolder, ['ALL'], console, (path: string) => {
    fs.unlinkSync(path);
  })
}

