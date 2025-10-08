import 'reflect-metadata'
import { DataSource } from 'typeorm';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const db = new DataSource({
  type: 'better-sqlite3',
  database: "db.sqlite",
  entities: [`${__dirname}/**/*.entity.ts`],
  synchronize: true,
  logging: false
})
