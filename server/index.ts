import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import { csvOutputFolder, uploadsFolder } from './config'
import { errorMiddleware } from './middleware'

import { categoriesRouter } from './domains/category'
import { uploadsRouter } from './domains/file'
import { outputsRouter } from './domains/output'
import { transactionRouter } from './domains/transaction'

import { db } from './persistence'

try {
  try {
    await db.initialize()
    console.log('DATA_SOURCE_READY')
  } catch (error) {
    console.error('DATA_SOURCE_ERROR', error)
    throw error
  }

  try {
    fs.mkdirSync(uploadsFolder, { recursive: true })
    fs.mkdirSync(csvOutputFolder, { recursive: true })
  } catch (error) {
    console.log(`DIRECTORY_CREATION_ERROR, ${error}`)
  }

  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))
  const PORT = process.env.PORT || 4000

  app.use(uploadsRouter)
  app.use(transactionRouter)
  app.use(categoriesRouter)
  app.use(outputsRouter)
  app.use(errorMiddleware)
  app.use((req, res, next) => {
    res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
  });

  app.listen(PORT, () => {
    console.log(`SERVER_READY http://localhost:${PORT}, uploads at ${uploadsFolder}`);
  });

} catch (error) {
  console.error('INIT_ERROR', error)
}