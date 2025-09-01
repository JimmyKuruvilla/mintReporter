import express, { NextFunction, Request, Response } from 'express'
import * as z from "zod";
import { Read, Write } from '../services/data';
import { Categories } from '../services/summary';
import { clearEditingFolder } from '../services/file';

export const dataRouter = express.Router()

dataRouter.get(
  '/inputs',
  async (req, res, next) => {
    try {
      const debits = await Read.allDebits()
      const credits = await Read.allCredits()
      const uncategorizableDebits = await Read.uncategorizableDebits()
      res.json({ debits, credits, uncategorizableDebits });
    } catch (error: any) {
      next(error)
    }
  });

dataRouter.put(
  '/inputs',
  async (req, res, next) => {
    try {
      // await clearEditingFolder()
      await Write.categorizedDebits(req.body)
      res.json(req.body);
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