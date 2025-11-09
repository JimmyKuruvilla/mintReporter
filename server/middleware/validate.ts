import { NextFunction, Request, Response } from 'express'
import z from 'zod'

export const validateMiddleware = (schema: z.Schema, reqProperty: string, cleanUp = () => { }) => async (req: Request, res: Response, next: NextFunction) => {
  const { success, error } = schema.safeParse((req as any)[reqProperty])
  if (!success) {
    await cleanUp()
    next(error)
  } else {
    next()
  }
}