import express from 'express';

import * as z from "zod";
import { ChaseIdToDetails } from '../../config/chaseIdtoDetails';
import { validateMiddleware } from '../../middleware';
import { db } from '../../persistence';
import { DAOMatcher } from '../category';
import { CategoryService } from '../category/category.service';
import { FileService } from '../file/file.service';
import { DAOHistoricalTransaction } from './dao.historicalTransaction';
import { DAOTransaction } from './dao.transaction';
import { TransactionService } from './transaction.service';

export const transactionRouter = express.Router()

const categoryService = new CategoryService({ repository: db.getRepository(DAOMatcher) })
const fileService = new FileService()
const svc = new TransactionService({
  repository: db.getRepository(DAOTransaction),
  historicalTransactionRepository: db.getRepository(DAOHistoricalTransaction),
  accounts: ChaseIdToDetails,
  fileService,
  categoryService
})

transactionRouter.get(
  '/transactions/history',
  async (req, res, next) => {

    try {
      // TODO: make this take a date range so we can just summarize on some of the data. 
      // update hte FE code to send dates for all these calls and verify everything works as expected. 
      // then move on to a historical view cmp
      
      // new cmp for historical data (can hold graphs later), with no ability to delete data. 
      // so in the working set you can delete data, but historical data has to be managed separately
      // add a button to copy the current working set to the historical table - last step in the workflow
      const { startDate, endDate } = req.body

      const {
        credits,
        debits,
        reconciliation
      } = await svc.createHistoricalReconciliation(startDate as string, endDate as string)

      res.json({ credits, debits, reconciliation });
    } catch (error: any) {
      next(error)
    }
  });

transactionRouter.post(
  '/transactions/history',
  async (req, res, next) => {

    try {
      const { startDate, endDate } = req.body
      await svc.copyCurrentToHistory(startDate as string, endDate as string)

      res.status(201)
    } catch (error: any) {
      next(error)
    }
  });


const TransactionGetQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
transactionRouter.get(
  '/transactions',
  validateMiddleware(TransactionGetQuerySchema, 'query'),
  async (req, res, next) => {

    try {
      const { startDate, endDate } = req.query

      const {
        credits,
        debits,
        reconciliation
      } = await svc.createReconciliation(startDate as string, endDate as string)

      res.json({ credits, debits, reconciliation });
    } catch (error: any) {
      next(error)
    }
  });

const TransactionDeleteQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});
transactionRouter.delete(
  '/transactions',
  validateMiddleware(TransactionDeleteQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query
      await svc.deleteCurrentByDateRange(startDate as string, endDate as string)

      const {
        credits,
        debits,
        reconciliation
      } = await svc.createReconciliation()

      res.json({ credits, debits, reconciliation });
    } catch (error: any) {
      next(error)
    }
  });

const TransactionPostBodySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});
transactionRouter.post(
  '/transactions',
  validateMiddleware(TransactionPostBodySchema, 'body'),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.body

      const {
        credits,
        debits,
        reconciliation
      } = await svc.createTransactions(startDate as string, endDate as string)

      res.json({ credits, debits, reconciliation });
    } catch (error: any) {
      next(error)
    }
  });

const EditsBodySchema = z.object({
  editedDebits: z.array(z.any()),
  editedCredits: z.array(z.any()),
});
transactionRouter.patch(
  '/transactions',
  validateMiddleware(EditsBodySchema, 'body'),
  async (req, res, next) => {
    try {
      const {
        credits,
        debits,
        reconciliation
      } = await svc.editTransactions(req.body.editedDebits, req.body.editedCredits)

      res.json({ credits, debits, reconciliation });
    } catch (error: any) {
      next(error)
    }
  });
