import fs from 'fs';
import { initialDataFolder, uploadsFolder } from '../config'
import { recursiveTraverse } from './utils'

export const clearInitialData = async () => recursiveTraverse(initialDataFolder, ['.json'], console, (path: string) => {
  fs.unlinkSync(path)
})

export const clearUploadsFolder = async () => recursiveTraverse(uploadsFolder, ['ALL'], console, (path: string) => {
  fs.unlinkSync(path)
})

export const readJsonFile = async <T>(filepath: string): Promise<T> => {
  return JSON.parse(await fs.readFileSync(filepath, { encoding: 'utf8' }))
}

export const LIST = {
  uploads: async () => fs.readdirSync(uploadsFolder)
}