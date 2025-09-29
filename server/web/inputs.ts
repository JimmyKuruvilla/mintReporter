import express, { NextFunction, Request, Response } from 'express'
import * as z from "zod";
import { getIdWithoutCategory, Read, Write } from '../services/data';
import { clearInitialData, } from '../services/file';
import { ICategorizedTransaction, } from '../services';
import { createInitialData, getReconciledSummary } from '../services/stages';
import { validateMiddleware } from '../middleware';

export const inputsRouter = express.Router()

inputsRouter.get(
  '/inputs',
  async (req, res, next) => {
    let reconciledSummary = {}
    let credits: ICategorizedTransaction[] = []
    let debits: ICategorizedTransaction[] = []

    try {
      try {
        const resp = await getReconciledSummary()
        reconciledSummary = resp.reconciledSummary
        credits = resp.credits
        debits = resp.debits
      }
      catch (error) {
        console.log(error)
      }

      res.json({ credits, debits, reconciledSummary });
    } catch (error: any) {
      next(error)
    }
  });

inputsRouter.delete(
  '/inputs',
  async (req, res, next) => {
    try {
      await clearInitialData()
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

      const { credits, debits, reconciledSummary, } = await getReconciledSummary()

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
      const editedDebits = req.body.editedDebits
      const editedDebitIds = editedDebits.map(getIdWithoutCategory)
      const allDebits = await Read.allDebits()

      const editedCredits = req.body.editedCredits
      const editedCreditIds = editedCredits.map(getIdWithoutCategory)
      const allCredits = await Read.allCredits()

      const modifiedAllDebits = [...editedDebits, ...allDebits.filter(t => !editedDebitIds.includes(getIdWithoutCategory(t)))]
      await Write.allDebits(modifiedAllDebits)

      const modifiedAllCredits = [...editedCredits, ...allCredits.filter(t => !editedCreditIds.includes(getIdWithoutCategory(t)))]
      await Write.allCredits(modifiedAllCredits)

      const { credits, debits, reconciledSummary, } = await getReconciledSummary()

      res.json({ credits, debits, reconciledSummary });
    } catch (error: any) {
      next(error)
    }
  });
