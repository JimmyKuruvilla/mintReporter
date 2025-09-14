import express, { NextFunction, Request, Response } from 'express'
import * as z from "zod";
import { getIdWithoutCategory, Read, Write } from '../services/data';
import { Categories } from '../services/summary';
import { clearEditingFolder, clearInitialData, clearUploadsFolder } from '../services/file';
import { CategorizedTransaction, ICategorizedTransaction } from '../services';
import { createFinalSummary, createInitialData } from '../services/stages';
import { validateMiddleware } from '../middleware';
import { csvOutputFilePath, FILE_NAMES } from '../config';

export const dataRouter = express.Router()

const readInputData = async () => {
  const debits = (await Read.allDebits()).map(CategorizedTransaction)
  const credits = (await Read.allCredits()).map(CategorizedTransaction)
  return { debits, credits }
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

dataRouter.delete(
  '/inputs',
  async (req, res, next) => {
    try {
      await clearUploadsFolder()
      console.log('CLEARED_UPLOADS_FOLDER')
      res.status(200).send({ credits: [], debits: [] });
    } catch (error: any) {
      next(error)
    }
  });

const InputsBodySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});
dataRouter.post(
  '/inputs',
  validateMiddleware(InputsBodySchema, 'body'),
  async (req, res, next) => {
    try {
      const startDate = req.body.startDate
      const endDate = req.body.endDate
      await clearInitialData()
      await createInitialData(new Date(startDate), new Date(endDate), ['.csv'])

      res.json((await readInputData()));
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

const EditsBodySchema = z.object({
  editedDebits: z.array(z.any()),
  editedCredits: z.array(z.any()),
});
dataRouter.post(
  '/edits',
  validateMiddleware(EditsBodySchema, 'body'),
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
      const { creditsCSV, debitsCSV, summaryCSV } = await createFinalSummary({ changedDebits: [] })
      res.json({ creditsCSV, debitsCSV, summaryCSV });
    } catch (error: any) {
      next(error)
    }
  });

dataRouter.get('/download/:filename',
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