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
      // new cmp for historical data (can hold graphs later), with no ability to delete data. 
      // so in the working set you can delete data, but historical data has to be managed separately
      // add a button to copy the current working set to the historical table - last step in the workflow
      const { startDate, endDate } = req.body

      const {
        credits,
        debits,
        reconciliation
      } = await svc.createHistoricalReconciliation(new Date(startDate), new Date(endDate))

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
      await svc.copyCurrentToHistory(new Date(startDate), new Date(endDate))

      res.status(201)
    } catch (error: any) {
      next(error)
    }
  });


transactionRouter.get(
  '/transactions',
  async (req, res, next) => {

    try {
      // TODO: make this take a date range so we can just summarize on some of the data. 
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

// TODO: make this take a date range so we can just wipe some of the data. 
transactionRouter.delete(
  '/transactions',
  async (req, res, next) => {
    try {
      await svc.deleteAllTransactions()
      res.status(200).send({ credits: [], debits: [], reconciliation: {} });
    } catch (error: any) {
      next(error)
    }
  });

const TransactionBodySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});
transactionRouter.post(
  '/transactions',
  validateMiddleware(TransactionBodySchema, 'body'),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.body

      const {
        credits,
        debits,
        reconciliation
      } = await svc.createTransactions(new Date(startDate), new Date(endDate))

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
