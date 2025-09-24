import express, { NextFunction, Request, Response } from 'express'
import * as z from "zod";

import { csvUploadMiddleware, validateMiddleware } from 'server/middleware';
import { clearUploadsFolder, LIST } from '../services/file';

export const uploadRouter = express.Router()
const UploadBodySchema = z.object({
  files: z.any(),
});

uploadRouter.post(
  '/uploads',
  csvUploadMiddleware.array('files', 20),
  validateMiddleware(UploadBodySchema, 'body', clearUploadsFolder),
  async (req, res, next) => {
    const files = (req as any).files || [];

    try {
      res.json((await LIST.uploads()).map(f => ({ filename: f })))
    } catch (error: any) {
      next(error)
    }
  });

uploadRouter.get(
  '/uploads',
  async (req, res, next) => {
    try {
      res.status(200).send((await LIST.uploads()).map(f => ({ filename: f })));
    } catch (error: any) {
      next(error)
    }
  });

uploadRouter.delete(
  '/uploads',
  async (req, res, next) => {
    try {
      await clearUploadsFolder()
      console.log('CLEARED_UPLOADS_FOLDER')
      res.status(200).send({});
    } catch (error: any) {
      next(error)
    }
  });