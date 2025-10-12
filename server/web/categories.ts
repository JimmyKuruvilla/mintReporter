import express from 'express';
import 'reflect-metadata';
import { getUiUmbrellaCategories } from 'server/services/category';
import * as z from "zod";
import { validateMiddleware } from '../middleware';
import { MatcherType, Persistence } from '../persistence';
import { getUiMatchers, SvcMatcher, SvcMatcherCtorArgs } from '../services/matcher.svc';

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
  type: z.enum([MatcherType.FINAL, MatcherType.MODIFIED])
});
categoriesRouter.post(
  '/categories/matchers/:type',
  validateMiddleware(MatchersParamsSchema, 'params'),
  async (req, res, next) => {
    try {
      if (req.params.type === MatcherType.FINAL) {
        await Persistence.matchers.modified.clear()
        await Persistence.matchers.final.write(
          req.body.map((matcher: SvcMatcherCtorArgs) => new SvcMatcher({ ...matcher, type: MatcherType.EMPTY }))
        )
      } else {
        await Persistence.matchers.modified.write(
          req.body.map((matcher: SvcMatcherCtorArgs) => new SvcMatcher({ ...matcher, type: MatcherType.EMPTY }))
        )
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

// TODO: move all business logic into services that handle clearly defined actions