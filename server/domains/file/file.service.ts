import fs from 'fs';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { uploadsFolder, finalMatchersFilePath, csvOutputFilePath, FILE_NAMES } from '../../config';

const json = (data: any) => JSON.stringify(data, null, 2);

export type IFileOnServer = { filename: string; };

const readJsonFile = async <T>(filepath: string): Promise<T> => {
  return JSON.parse(await fs.readFileSync(filepath, { encoding: 'utf8' }))
}

const recursiveTraverse = async (rootPath: string, allowedExtensions: string[], logger: any, operationFn: (fullPath: string) => void) => {
  const allowedExts = allowedExtensions.length === 1 && allowedExtensions[0] === 'ALL' ? [] : allowedExtensions.map(ext => ext.toLowerCase());
  const filenames = await readdir(rootPath);

  for (const filename of filenames) {
    const fullPath = path.join(rootPath, filename);
    const stats = await stat(fullPath);

    try {
      if (stats.isDirectory()) {
        await recursiveTraverse(fullPath, allowedExts, logger, operationFn);
      } else {
        if (allowedExts.length === 0) {
          await operationFn(fullPath);
        } else if (allowedExts.includes(path.extname(filename).toLowerCase())) {
          await operationFn(fullPath);
        }
      }
    } catch (error: any) {
      logger.error(error);
    }
  }
};

export const traverse = {
  recursive: recursiveTraverse
}

export const listMany = {
  uploads: async () => fs.readdirSync(uploadsFolder)
};

export type IMatchersFromFile = { [umbrellaCategory: string]: string; };
export const read = {
  finalMatchers: () => readJsonFile<IMatchersFromFile>(finalMatchersFilePath()),
};

export const write = {
  outputDebits: (data: string) => fs.writeFileSync(csvOutputFilePath(FILE_NAMES.CSV.DEBITS), data),
  outputCredits: (data: string) => fs.writeFileSync(csvOutputFilePath(FILE_NAMES.CSV.CREDITS), data),
  outputSummary: (data: string) => fs.writeFileSync(csvOutputFilePath(FILE_NAMES.CSV.SUMMARY), data)
};

export const remove = {};

export const removeMany = {
  uploads: () => recursiveTraverse(uploadsFolder, ['ALL'], console, (path: string) => {
    fs.unlinkSync(path);
  })
};

