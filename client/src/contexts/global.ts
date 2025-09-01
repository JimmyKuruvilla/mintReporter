import dayjs, { Dayjs } from 'dayjs';
import { createContext } from 'react';
import { ICategorizedTransaction } from '@/server/services/transaction';

/* 
const debit = {
  "date": "2025-08-03T05:00:00.000Z",
  "amount": -115.55,
  "metadata": {
    "bank_account": { "checkNumber": "" },
    "chaseType": "sale"
  },
  "description": "ULTA #69",
  "transactionType": "debit",
  "accountName": "Out and About",
  "accountType": "credit_card_account",
  "permanentCategory": "",
  "permanentCategoryQuery": "",
  "category": "PersonalCare"
} 
*/
export type APIIngestedData = {
  debits: ICategorizedTransaction[],
  credits: ICategorizedTransaction[],
  uncategorizableDebits: ICategorizedTransaction[]
}

export type CTX = {
  uploadStartDate: Dayjs,
  uploadEndDate: Dayjs,
  ingestedData: APIIngestedData
}

export const initialCtx: CTX = {
  uploadStartDate: dayjs(new Date()).startOf('month'),
  uploadEndDate: dayjs(new Date()).endOf('month'),
  ingestedData: {
    debits: [],
    credits: [],
    uncategorizableDebits: []
  }
}

const defaultValue = {
  ctx: initialCtx,
  setCtx: (arg: any) => { }
}

export const GlobalContext = createContext(defaultValue);