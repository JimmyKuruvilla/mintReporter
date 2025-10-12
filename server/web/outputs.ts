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
        filename = FILE_NAMES.CSV.DEBITS
        break
      case 'credit':
        filename = FILE_NAMES.CSV.CREDITS
        break
      case 'summary':
        filename = FILE_NAMES.CSV.SUMMARY
        break
      default:
        filename = FILE_NAMES.CSV.SUMMARY
    }

    res.download(csvOutputFilePath(filename));
  });