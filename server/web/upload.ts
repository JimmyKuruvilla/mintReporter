import express, { NextFunction, Request, Response } from 'express'
import * as z from "zod";

import { csvUploadMiddleware, validateMiddleware } from 'server/middleware';
import { clearUploadsFolder } from '../services/file';

export const uploadRouter = express.Router()
const UploadBodySchema = z.object({
  files: z.any(),
});

uploadRouter.post(
  '/upload',
  csvUploadMiddleware.array('files', 20),
  validateMiddleware(UploadBodySchema, 'body', clearUploadsFolder),
  async (req, res, next) => {
    const files = (req as any).files || [];
    
    try {
      res.json({ count: files.length, files: files.map((f: any) => ({ filename: f.filename, size: f.size })) });
    } catch (error: any) {
      next(error)
    }
  });