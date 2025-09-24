import express, { NextFunction, Request, Response } from 'express'
import * as z from "zod";
import { Delete, getIdWithoutCategory, Read, Write } from '../services/data';
import { getUiUmbrellaCategories, uiMatchersToDbMatchers, getUiMatchers } from '../services/summary';
import { clearEditingFolder, clearInitialData, clearUploadsFolder } from '../services/file';
import { CategorizedTransaction, ICategorizedTransaction } from '../services';
import { createFinalSummaryCSVs, createInitialData, getReconciledSummary } from '../services/stages';
import { validateMiddleware } from '../middleware';
import { csvOutputFilePath, FILE_NAMES } from '../config';

export const dataRouter = express.Router()

const FINAL = 'final'
const MODIFIED = 'modified'

const readInitialData = async () => {
  const debits = (await Read.allDebits()).map(CategorizedTransaction)
  const credits = (await Read.allCredits()).map(CategorizedTransaction)
  return { debits, credits }
}

dataRouter.get(
  '/inputs',
  async (req, res, next) => {
    let reconciledSummary = {}
    try {
      try {
        const resp = await getReconciledSummary({ changedDebits: [] })
        reconciledSummary = resp.reconciledSummary
      }
      catch (error) {
        console.log(error)
      }

      const { credits, debits } = await readInitialData()
      res.json({ credits, debits, reconciledSummary });
    } catch (error: any) {
      next(error)
    }
  });

dataRouter.delete(
  '/inputs',
  async (req, res, next) => {
    try {
      await clearInitialData()
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
      await createInitialData(new Date(startDate), new Date(endDate), ['.csv'])

      const { credits, debits } = await readInitialData()
      const { reconciledSummary, } = await getReconciledSummary({ changedDebits: [] })

      res.json({ credits, debits, reconciledSummary });
    } catch (error: any) {
      next(error)
    }
  });

const EditsBodySchema = z.object({
  editedDebits: z.array(z.any()),
  editedCredits: z.array(z.any()),
});
dataRouter.patch(
  '/inputs',
  validateMiddleware(EditsBodySchema, 'body'),
  async (req, res, next) => {
    try {
      await clearEditingFolder()
      await Write.editedDebits(req.body.editedDebits)
      await Write.editedCredits(req.body.editedCredits)

      const editedDebits = await Read.editedDebits()
      const editedCredits = await Read.editedCredits()
      const allDebits = await Read.allDebits()
      const allCredits = await Read.allCredits()
      const uncategorizableDebits = await Read.uncategorizableDebits()

      const editedDebitIds = editedDebits.map(getIdWithoutCategory)
      const editedCreditIds = editedCredits.map(getIdWithoutCategory)

      const modifiedUncategorizableDebits = uncategorizableDebits.filter(u => !editedDebitIds.includes(getIdWithoutCategory(u)))
      await Write.uncategorizableDebits(modifiedUncategorizableDebits)

      const modifiedAllDebits = [...editedDebits, ...allDebits.filter(t => !editedDebitIds.includes(getIdWithoutCategory(t)))]
      await Write.allDebits(modifiedAllDebits)

      const modifiedAllCredits = [...editedCredits, ...allCredits.filter(t => !editedCreditIds.includes(getIdWithoutCategory(t)))]
      await Write.allCredits(modifiedAllCredits)

      const { credits, debits } = await readInitialData()
      const { reconciledSummary, } = await getReconciledSummary({ changedDebits: [] })

      res.json({ credits, debits, reconciledSummary });
    } catch (error: any) {
      next(error)
    }
  });

dataRouter.get(
  '/categories',
  async (req, res, next) => {
    try {
      res.json((await getUiUmbrellaCategories()));
    } catch (error: any) {
      next(error)
    }
  });

dataRouter.get(
  '/categories/matchers',
  async (req, res, next) => {
    try {
      res.json({
        categories: (await getUiUmbrellaCategories()),
        matchers: await getUiMatchers()
      });
    } catch (error: any) {
      next(error)
    }
  });

const MatchersParamsSchema = z.object({
  type: z.enum([FINAL, MODIFIED])
});
dataRouter.post(
  '/categories/matchers/:type',
  validateMiddleware(MatchersParamsSchema, 'params'),
  async (req, res, next) => {
    try {
      if (req.params.type === FINAL) {
        await Write.finalMatchers(uiMatchersToDbMatchers(req.body))
      } else {
        await Write.modifiedMatchers(uiMatchersToDbMatchers(req.body))
      }
      res.json({
        categories: (await getUiUmbrellaCategories()),
        matchers: await getUiMatchers()
      });
    } catch (error: any) {
      next(error)
    }
  });

dataRouter.delete(
  '/categories/matchers/modified',
  async (req, res, next) => {
    try {
      try {
        await Delete.modifiedMatchers()
      } catch (error) {
        console.warn(`No modified file to delete`)
      }

      res.json({
        categories: (await getUiUmbrellaCategories()),
        matchers: await getUiMatchers()
      });
    } catch (error: any) {
      next(error)
    }
  });

dataRouter.post(
  '/outputs',
  async (req, res, next) => {
    try {
      const { creditsCSV, debitsCSV, summaryCSV } = await createFinalSummaryCSVs({ changedDebits: [] })
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