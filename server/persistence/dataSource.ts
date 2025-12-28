import { dirname } from 'path'
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const db = new DataSource({
  type: 'better-sqlite3',
  database: 'db.sqlite',
  entities: [`${__dirname}/../domains/**/dao.*.ts`],
  synchronize: true,
  logging: false
})
