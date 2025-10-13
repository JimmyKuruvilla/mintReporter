import express from 'express';
import { ChaseIdToDetails, csvOutputFilePath, FILE_NAMES } from '../../config';
import { db } from '../../persistence';
import { CategoryService, DAOMatcher } from '../category';
import { FileService } from '../file';
import { DAOTransaction, TransactionService } from '../transaction';
import { OutputService } from './output.service';

const categoryService = new CategoryService({ repository: db.getRepository(DAOMatcher) })
const fileService = new FileService()
const transactionService = new TransactionService({ repository: db.getRepository(DAOTransaction), accounts: ChaseIdToDetails, fileService, categoryService })
const svc = new OutputService({ fileService, transactionService })

export const outputsRouter = express.Router()

outputsRouter.post(
  '/outputs',
  async (req, res, next) => {
    try {
      const { creditsCSV, debitsCSV, summaryCSV } = await svc.createFinalCSVs()
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