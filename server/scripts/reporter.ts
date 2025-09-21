#!/usr/bin env node
import { COMMA } from '../constants';
import { Read, } from '../services';
import { clearInitialData } from '../services/file';
import { createInitialData, createFinalSummary } from '../services/stages';

const STAGE = (process.env as any).STAGE;

(async () => {
  switch (STAGE) {
    case 'writeInitialData':
      const START_DATE = process.env.START_DATE!
      const END_DATE = process.env.END_DATE!
      const FILE_EXTS = process.env.FILE_EXTS ? process.env.FILE_EXTS.split(COMMA) : ['.CSV']

      if (!START_DATE || !END_DATE) {
        throw new Error('missing required config: start date, end date')
      }
      console.log(`Running reports using ${FILE_EXTS}`)

      await clearInitialData()
      await createInitialData(new Date(START_DATE), new Date(END_DATE), FILE_EXTS);
      break;
    case 'writeFinalSummary':
      const changedDebits = await Read.uncategorizableDebits()
      await createFinalSummary({ changedDebits })
      break;
    default:
      console.log('NO STAGE PROVIDED')
      return
  }
})()
