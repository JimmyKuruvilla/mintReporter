import express from 'express';
import { csvUploadMiddleware, validateMiddleware } from 'server/middleware';
import * as z from 'zod';
import { FileService } from './file.service';

const fileService = new FileService()

export const uploadsRouter = express.Router()

const UploadBodySchema = z.object({
  files: z.any(),
});
uploadsRouter.post(
  '/uploads',
  csvUploadMiddleware.array('files', 20),
  validateMiddleware(UploadBodySchema, 'body', fileService.removeMany.uploads),
  async (req, res, next) => {
    try {
      res.json((await fileService.listMany.uploads()).map(f => ({ filename: f })))
    } catch (error: any) {
      next(error)
    }
  });

uploadsRouter.get(
  '/uploads',
  async (req, res, next) => {
    try {
      res.status(200).send((await fileService.listMany.uploads()).map(f => ({ filename: f })));
    } catch (error: any) {
      next(error)
    }
  });

uploadsRouter.delete(
  '/uploads',
  async (req, res, next) => {
    try {
      await fileService.removeMany.uploads()
      console.log('CLEARED_UPLOADS_FOLDER')
      res.status(200).send({});
    } catch (error: any) {
      next(error)
    }
  });