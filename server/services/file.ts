import fs from 'fs';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export type IFileOnServer = { filename: string; };

export const readJsonFile = async <T>(filepath: string): Promise<T> => {
  return JSON.parse(await fs.readFileSync(filepath, { encoding: 'utf8' }))
}

export const recursiveTraverse = async (rootPath: string, allowedExtensions: string[], logger: any, operationFn: (fullPath: string) => void) => {
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
