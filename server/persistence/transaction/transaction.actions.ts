import { EntityManager } from 'typeorm';
import { Persistence } from '..';
import { ICategorizedTransactionDTO } from '../../services/transaction';
import { db } from '../db';
import { CategorizedTransaction, TransactionType } from './transaction.entity';

const CategorizedTransactionRepo = db.getRepository(CategorizedTransaction)
const getManager = (manager?: EntityManager): any => {
  if (manager) {
    return manager
  } else {
    return CategorizedTransactionRepo
  }
}

export const debitActions = {
  read: async (): Promise<ICategorizedTransactionDTO[]> => {
    return (await CategorizedTransactionRepo.find({ where: { type: TransactionType.DEBIT } })).map(m => m.toDTO())
  },
  // clear: () => CategorizedTransactionRepo.delete({ type: TransactionType.DEBIT }),
  write: async (transactions: CategorizedTransaction[], manager?: EntityManager) => {
    await getManager(manager).save(transactions.map(t => {
      t.type = TransactionType.DEBIT;
      return t
    }))
  },
}

export const creditActions = {
  read: async (): Promise<ICategorizedTransactionDTO[]> => {
    return (await CategorizedTransactionRepo.find({ where: { type: TransactionType.CREDIT } })).map(m => m.toDTO())
  },
  // clear: () => CategorizedTransactionRepo.delete({ type: TransactionType.CREDIT }),
  write: async (transactions: CategorizedTransaction[], manager?: EntityManager) => {
    await getManager(manager).save(transactions.map(t => {
      t.type = TransactionType.CREDIT;
      return t
    }))
  },
}

export const allActions = {
  clear: () => CategorizedTransactionRepo.clear(),
}