import express, { NextFunction, Request, Response } from 'express'
import multer from 'multer';
import fs from 'fs';
import * as z from "zod";
import { uploadsFolder } from '../config';
import { clearInitialData, clearUploadsFolder } from '../services/utils';
import { createInitialData } from '../services/data';
import { csvUploadMiddleware, validateMiddleware } from 'server/middleware';

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