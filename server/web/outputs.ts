import express from 'express';
import { createFinalCSVs } from 'server/services/csv';
import { csvOutputFilePath, FILE_NAMES } from '../config';

export const outputsRouter = express.Router()

outputsRouter.post(
  '/outputs',
  async (req, res, next) => {
    try {
      const { creditsCSV, debitsCSV, summaryCSV } = await createFinalCSVs()
      res.json({ creditsCSV, debitsCSV, summaryCSV });
    } catch (error: any) {
      next(error)
    }
  });

outputsRouter.get('/outputs/:filename',
  (req, res) => {
    let filename;

    switch (req.params.filename) {
      case 'debit':
        filename = FILE_NAMES.ALL_DEBITS
        break
      case 'credit':
        filename = FILE_NAMES.ALL_CREDITS
        break
      case 'summary':
        filename = FILE_NAMES.SUMMARY
        break
      default:
        filename = FILE_NAMES.SUMMARY
    }

    res.download(csvOutputFilePath(filename));
  });