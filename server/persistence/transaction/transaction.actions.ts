import { EntityManager } from 'typeorm';
import { SvcTransaction } from '../../services/svcTransaction';
import { db } from '../db';
import { CategorizedTransactionDAO, TransactionType } from './transaction.dao';

const CategorizedTransactionRepo = db.getRepository(CategorizedTransactionDAO)
const getManager = (manager?: EntityManager): any => {
  if (manager) {
    return manager
  } else {
    return CategorizedTransactionRepo
  }
}

export const debitActions = {
  read: async (): Promise<SvcTransaction[]> => {
    return (await CategorizedTransactionRepo.find({ where: { type: TransactionType.DEBIT } })).map(m => m.toSvc())
  },
  // clear: () => CategorizedTransactionRepo.delete({ type: TransactionType.DEBIT }),
  write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
    await getManager(manager).save(transactions.map(t =>
      new CategorizedTransactionDAO({ ...t, transactionType: TransactionType.DEBIT })
    ))
  },
}

export const creditActions = {
  read: async (): Promise<SvcTransaction[]> => {
    return (await CategorizedTransactionRepo.find({ where: { type: TransactionType.CREDIT } })).map(m => m.toSvc())
  },
  // clear: () => CategorizedTransactionRepo.delete({ type: TransactionType.CREDIT }),
  write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
    await getManager(manager).save(transactions.map(t =>
      new CategorizedTransactionDAO({ ...t, transactionType: TransactionType.CREDIT })
    ))
  },
}

export const allActions = {
  clear: () => CategorizedTransactionRepo.clear(),
  write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
    await getManager(manager).save(transactions.map(t =>
      new CategorizedTransactionDAO(t)
    ))
  }
}