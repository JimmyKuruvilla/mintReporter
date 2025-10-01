import { NextFunction, Request, Response } from 'express';

export const errorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  let respError;
  let status;

  if (error.issues) {
    status = 400
    respError = { type: 'HttpReqValidationError', error: error.issues, stack: error.stack }
  } else {
    status = 500
    respError = { type: 'Server Error', error: error.toString(), stack: error.stack }
  }

  console.error(respError)
  res.status(400).json(respError)
}