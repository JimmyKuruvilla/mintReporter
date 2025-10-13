import express from 'express';

import * as z from "zod";
import { ChaseIdToDetails } from '../../config/chaseIdtoDetails';
import { validateMiddleware } from '../../middleware';
import { CategoryService } from '../category/category.service';
import { FileService } from '../file/file.service';
import { TransactionService } from './transaction.service';

export const transactionRouter = express.Router()
const categoryService = new CategoryService()
const fileService = new FileService()
const svc = new TransactionService({ accounts: ChaseIdToDetails, fileService, categoryService })

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
      const startDate = req.body.startDate
      const endDate = req.body.endDate

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
