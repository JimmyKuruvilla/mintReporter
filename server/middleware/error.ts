import { NextFunction, Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

export const errorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  let respError;
  let status;

  if (error instanceof QueryFailedError) {
    status = 400
    respError = {
      type: 'DBError',
      error: error.message,
      code: error.driverError.code,
      parameters: error.parameters,
      stack: error.stack
    }
  } else if (error.issues) {
    status = 400
    respError = { type: 'HttpReqValidationError', error: error.issues, stack: error.stack }
  } else {
    status = 500
    respError = { type: 'ServerError', error: error.toString(), stack: error.stack }
  }

  console.error(respError)
  res.status(400).json(respError)
}