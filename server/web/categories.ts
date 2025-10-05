import 'reflect-metadata'
import express from 'express';
import { getUiUmbrellaCategories } from 'server/services/category';
import * as z from "zod";
import { validateMiddleware } from '../middleware';
import { getUiMatchers, uiMatchersToDbMatchers } from '../services/matcher';
import { Persistence } from '../persistence';
import { FINAL, MODIFIED } from '../persistence/constants';

export const categoriesRouter = express.Router()

categoriesRouter.get(
  '/categories',
  async (req, res, next) => {
    try {
      res.json((await getUiUmbrellaCategories()));
    } catch (error: any) {
      next(error)
    }
  });

categoriesRouter.get(
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
categoriesRouter.post(
  '/categories/matchers/:type',
  validateMiddleware(MatchersParamsSchema, 'params'),
  async (req, res, next) => {
    try {
      if (req.params.type === FINAL) {
        await Persistence.matchers.modified.clear()
        await Persistence.matchers.final.write(uiMatchersToDbMatchers(req.body))
      } else {
        await Persistence.matchers.modified.write(uiMatchersToDbMatchers(req.body))
      }
      res.json({
        categories: (await getUiUmbrellaCategories()),
        matchers: await getUiMatchers()
      });
    } catch (error: any) {
      next(error)
    }
  });

categoriesRouter.delete(
  '/categories/matchers/modified',
  async (req, res, next) => {
    try {
      try {
        await Persistence.matchers.modified.clear()
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