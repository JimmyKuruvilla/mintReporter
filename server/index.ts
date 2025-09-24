import express from 'express'
import cors from 'cors'
import { uploadsFolder } from './config'
import { errorMiddleware } from './middleware'

import { uploadsRouter } from './web/uploads'
import { categoriesRouter } from './web/categories'
import { inputsRouter } from './web/inputs'
import { outputsRouter } from './web/outputs'

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
  console.log(`Server listening on http://localhost:${PORT}, uploads at ${uploadsFolder}`);
});
