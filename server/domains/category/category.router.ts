import express from 'express';
import * as z from "zod";

import { validateMiddleware } from '../../middleware';
import { CategoryService } from './category.service';
import { MatcherType } from './matcherType';
import { SvcMatcherCtorArgs } from './svc.matcher';

const svc = new CategoryService()
export const categoriesRouter = express.Router()

categoriesRouter.get(
  '/categories',
  async (req, res, next) => {
    try {
      res.json((await svc.getUiCategories()));
    } catch (error: any) {
      next(error)
    }
  });

categoriesRouter.get(
  '/categories/matchers',
  async (req, res, next) => {
    try {
      res.json({
        categories: (await svc.getUiCategories()),
        matchers: await svc.getUiMatchers()
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
      await svc.createMatchers(req.params.type as MatcherType, req.body as SvcMatcherCtorArgs[])

      res.json({
        categories: await svc.getUiCategories(),
        matchers: await svc.getUiMatchers()
      });
    } catch (error: any) {
      next(error)
    }
  });

categoriesRouter.delete(
  '/categories/matchers/modified',
  async (req, res, next) => {
    try {
      await svc.deleteModifiedMatchers()

      res.json({
        categories: await svc.getUiCategories(),
        matchers: await svc.getUiMatchers()
      });
    } catch (error: any) {
      next(error)
    }
  });