import fs from 'node:fs'
import express from 'express'
import cors from 'cors'
import { csvOutputFolder, uploadsFolder } from './config'
import { errorMiddleware } from './middleware'

import { uploadsRouter } from './web/uploads'
import { categoriesRouter } from './web/categories'
import { inputsRouter } from './web/inputs'
import { outputsRouter } from './web/outputs'
import { Persistence } from './persistence'

try {
  try {
    await Persistence.db.initialize()
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
  app.use(inputsRouter)
  app.use(categoriesRouter)
  app.use(outputsRouter)
  app.use(errorMiddleware)

  app.listen(PORT, () => {
    console.log(`SERVER_READY http://localhost:${PORT}, uploads at ${uploadsFolder}`);
  });

} catch (error) {
  console.error('INIT_ERROR', error)
}