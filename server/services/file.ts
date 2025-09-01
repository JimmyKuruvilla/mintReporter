import fs from 'fs';
import { initialDataFolder, uploadsFolder, editingFolder } from '../config'
import { recursiveTraverse } from './utils'

export const clearInitialData = async () => recursiveTraverse(initialDataFolder, ['.json'], console, (path: string) => {
  fs.unlinkSync(path)
})

export const clearUploadsFolder = async () => recursiveTraverse(uploadsFolder, ['ALL'], console, (path: string) => {
  fs.unlinkSync(path)
})

export const clearEditingFolder = async () => recursiveTraverse(editingFolder, ['ALL'], console, (path: string) => {
  fs.unlinkSync(path)
})

export const readJsonFile = async <T>(filepath: string): Promise<T> => {
  return JSON.parse(await fs.readFileSync(filepath, { encoding: 'utf8' }))
}