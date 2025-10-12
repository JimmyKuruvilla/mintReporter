import express from 'express';

import * as z from "zod";
import { validateMiddleware } from '../middleware';
import { Persistence } from '../persistence';
import { SvcReconciliation, SvcTransaction, SvcTransactionCtorArgs, } from '../services';
import { createInitialData } from '../services/ingestion';

export const inputsRouter = express.Router()

inputsRouter.get(
  '/inputs',
  async (req, res, next) => {
    let reconciledSummary = {}
    let credits: SvcTransaction[] = []
    let debits: SvcTransaction[] = []

    try {
      try {
        // TODO: make this take a date range so we can just summarize on some of the data. 
        const resp = await new SvcReconciliation().calc()
        reconciledSummary = resp.reconciliation
        credits = resp.credits
        debits = resp.debits
      } catch (error) {
        console.log(error)
      }

      res.json({ credits, debits, reconciledSummary });
    } catch (error: any) {
      next(error)
    }
  });

// TODO: make this take a date range so we can just wipe some of the data. 
inputsRouter.delete(
  '/inputs',
  async (req, res, next) => {
    try {
      await Persistence.transactions.all.clear()
      res.status(200).send({ credits: [], debits: [], reconciledSummary: {} });
    } catch (error: any) {
      next(error)
    }
  });

const InputsBodySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});
inputsRouter.post(
  '/inputs',
  validateMiddleware(InputsBodySchema, 'body'),
  async (req, res, next) => {
    try {
      const startDate = req.body.startDate
      const endDate = req.body.endDate
      await createInitialData(new Date(startDate), new Date(endDate), ['.csv'])

      const { credits, debits, reconciliation: reconciledSummary, } = await new SvcReconciliation().calc()

      res.json({ credits, debits, reconciledSummary });
    } catch (error: any) {
      next(error)
    }
  });

const EditsBodySchema = z.object({
  editedDebits: z.array(z.any()),
  editedCredits: z.array(z.any()),
});
inputsRouter.patch(
  '/inputs',
  validateMiddleware(EditsBodySchema, 'body'),
  async (req, res, next) => {
    try {
      const editedDebits: SvcTransactionCtorArgs[] = req.body.editedDebits
      const editedCredits: SvcTransactionCtorArgs[] = req.body.editedCredits

      await Persistence.transactions.debits.write(editedDebits.map(t => new SvcTransaction(t)))
      await Persistence.transactions.credits.write(editedCredits.map(t => new SvcTransaction(t)))

      const { credits, debits, reconciliation: reconciledSummary, } = await new SvcReconciliation().calc()

      res.json({ credits, debits, reconciledSummary });
    } catch (error: any) {
      next(error)
    }
  });
