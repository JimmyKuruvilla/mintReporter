import express, { NextFunction, Request, Response } from 'express'
import * as z from "zod";

import { csvUploadMiddleware, validateMiddleware } from 'server/middleware';
import { createInitialData } from '../services/stages';
import { clearInitialData, clearUploadsFolder } from '../services/file';

export const uploadRouter = express.Router()
const UploadParamsSchema = z.object({
  files: z.any(),
  startDate: z.string(),
  endDate: z.string()
});

uploadRouter.post(
  '/upload',
  csvUploadMiddleware.array('files', 20),
  validateMiddleware(UploadParamsSchema, 'body', clearUploadsFolder),
  async (req, res, next) => {
    const { startDate, endDate } = req.body
    const files = (req as any).files || [];
    
    try {
      await clearInitialData()
      await createInitialData(new Date(startDate), new Date(endDate), ['.csv'])
      await clearUploadsFolder()
      res.json({ count: files.length, files: files.map((f: any) => ({ filename: f.filename, size: f.size })) });
    } catch (error: any) {
      next(error)
    }
  });