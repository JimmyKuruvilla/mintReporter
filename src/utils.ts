import { readdir, stat } from 'node:fs/promises'
import path from 'path'

export const recursiveTraverse = async (rootPath: string, ALLOWED_EXTENSIONS: string[], logger: any, operationFn: (fullPath: string) => void) => {
  const filenames = await readdir(rootPath)

  for (const filename of filenames) {
    const fullPath = path.join(rootPath, filename)
    const stats = await stat(fullPath)

    try {
      if (stats.isDirectory()) {
        await recursiveTraverse(fullPath, ALLOWED_EXTENSIONS, logger, operationFn)
      } else {
        // why doesn't path exist here?
        if (ALLOWED_EXTENSIONS.includes(path.extname(filename))) {
          await operationFn(fullPath)
        }
      }
    } catch (error: any) {
      logger.error(error)
    }
  }
}
