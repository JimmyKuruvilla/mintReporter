import { NextFunction, Request, Response } from 'express'

export const errorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.issues) {
    return res.status(400).json({ type: 'HttpReqValidationError', error: error.issues, stack: error.stack })
  }
  return res.status(500).json({ type: 'Server Error', error: error.toString(), stack: error.stack })
}