import express from 'express'
import cors from 'cors'
import { uploadRouter } from './web/upload'
import { uploadsFolder } from './config'
import { errorMiddleware } from './middleware'

const app = express()
app.use(cors())
const PORT = process.env.PORT || 4000

app.use(uploadRouter)
app.use(errorMiddleware)

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}, uploads at ${uploadsFolder}`);
});
