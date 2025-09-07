import express, { NextFunction, Request, Response } from 'express'
import { uniqBy } from 'lodash';
import * as z from "zod";
import { getIdWithoutCategory, Read, Write } from '../services/data';
import { Categories } from '../services/summary';
import { clearEditingFolder } from '../services/file';
import { CategorizedTransaction, ICategorizedTransaction } from '../services';
import { createFinalSummary } from '../services/stages';
import { validateMiddleware } from '../middleware';

export const dataRouter = express.Router()

const readInputData = async () => {
  const debits = (await Read.allDebits()).map(CategorizedTransaction)
  const credits = (await Read.allCredits()).map(CategorizedTransaction)
  const uncategorizableDebits = (await Read.uncategorizableDebits()).map(CategorizedTransaction)
  const editedDebits = (await Read.editedDebits()).map(CategorizedTransaction)
  return { debits, credits, uncategorizableDebits, editedDebits }
}

dataRouter.get(
  '/inputs',
  async (req, res, next) => {
    try {
      const inputs = await readInputData();
      res.json(inputs);
    } catch (error: any) {
      next(error)
    }
  });

dataRouter.get(
  '/categories',
  async (req, res, next) => {
    try {
      res.json(Categories);
    } catch (error: any) {
      next(error)
    }
  });

const EditParamsSchema = z.object({
  editedDebits: z.array(z.any()),
  editedCredits:  z.array(z.any()),
});
dataRouter.post(
  '/edits',
  validateMiddleware(EditParamsSchema, 'body'),
  async (req, res, next) => {
    try {
      await clearEditingFolder()
      await Write.editedDebits(req.body.editedDebits)
      await Write.editedCredits(req.body.editedCredits)

      const editedDebits = await Read.editedDebits()
      const editedCredits = await Read.editedCredits()
      const allDebits = await Read.allDebits()
      const uncategorizableDebits = await Read.uncategorizableDebits()

      const editedDebitIds = editedDebits.map(getIdWithoutCategory)
      const editedCreditIds = editedCredits.map(getIdWithoutCategory)

      // TODO: ignoring uncategorizedCredits because it isn't part of the flow right now. Meaning credit updates will not propogate. 
      const modifiedUncategorizableDebits = uncategorizableDebits.filter(u => !editedDebitIds.includes(getIdWithoutCategory(u)))
      await Write.uncategorizableDebits(modifiedUncategorizableDebits)
      
      const modifiedAllDebits = [...allDebits.filter(u => !editedDebitIds.includes(getIdWithoutCategory(u))), ...editedDebits]
      await Write.allDebits(modifiedAllDebits)

      res.json((await readInputData()));
    } catch (error: any) {
      next(error)
    }
  });

dataRouter.post(
  '/outputs',
  async (req, res, next) => {
    try {
      await createFinalSummary({ changedDebits:[] })

      res.json({}); // fix me
    } catch (error: any) {
      next(error)
    }
  });