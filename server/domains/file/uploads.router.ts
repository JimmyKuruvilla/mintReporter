import express from 'express';
import * as z from 'zod';

import { csvUploadMiddleware, validateMiddleware } from 'server/middleware';
import { listMany, removeMany } from './file.service';

export const uploadsRouter = express.Router()
const UploadBodySchema = z.object({
  files: z.any(),
});

uploadsRouter.post(
  '/uploads',
  csvUploadMiddleware.array('files', 20),
  validateMiddleware(UploadBodySchema, 'body', removeMany.uploads),
  async (req, res, next) => {
    const files = (req as any).files || [];

    try {
      res.json((await listMany.uploads()).map(f => ({ filename: f })))
    } catch (error: any) {
      next(error)
    }
  });

uploadsRouter.get(
  '/uploads',
  async (req, res, next) => {
    try {
      res.status(200).send((await listMany.uploads()).map(f => ({ filename: f })));
    } catch (error: any) {
      next(error)
    }
  });

uploadsRouter.delete(
  '/uploads',
  async (req, res, next) => {
    try {
      await removeMany.uploads()
      console.log('CLEARED_UPLOADS_FOLDER')
      res.status(200).send({});
    } catch (error: any) {
      next(error)
    }
  });