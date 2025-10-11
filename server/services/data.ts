import fs from 'fs';
import { FILE_NAMES, csvOutputFilePath, finalMatchersFilePath, modifiedMatchersFilePath, uploadsFolder } from '../config';
import { readJsonFile, recursiveTraverse } from './file';
export type IDbMatchers = { [umbrellaCategory: string]: string }

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
  outputDebits: (data: string) =>
    fs.writeFileSync(csvOutputFilePath(FILE_NAMES.ALL_DEBITS), data),
  outputCredits: (data: string) =>
    fs.writeFileSync(csvOutputFilePath(FILE_NAMES.ALL_CREDITS), data),
  outputSummary: (data: string) =>
    fs.writeFileSync(csvOutputFilePath(FILE_NAMES.SUMMARY), data)
}

export const Delete = {}

export const DeleteFiles = {
  uploads: () => recursiveTraverse(uploadsFolder, ['ALL'], console, (path: string) => {
    fs.unlinkSync(path);
  })
}

