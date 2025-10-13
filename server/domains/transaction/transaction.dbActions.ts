import { EntityManager } from 'typeorm'
import { db } from '../../persistence/dataSource'
import { TransactionType } from './transactionType'
import { DAOTransaction, SvcTransaction } from '.'

const repo = () => db.getRepository(DAOTransaction)

const getManager = (manager?: EntityManager): any => {
  if (manager) {
    return manager
  } else {
    return repo()
  }
}

export const debitActions = {
  read: async (): Promise<SvcTransaction[]> => {
    return (await repo().find({ where: { type: TransactionType.DEBIT } })).map(m => m.toSvc())
  },
  // clear: () => CategorizedTransactionRepo.delete({ type: TransactionType.DEBIT }),
  write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
    await getManager(manager).save(transactions.map(t =>
      new DAOTransaction({ ...t, transactionType: TransactionType.DEBIT })
    ))
  },
}

export const creditActions = {
  read: async (): Promise<SvcTransaction[]> => {
    return (await repo().find({ where: { type: TransactionType.CREDIT } })).map(m => m.toSvc())
  },
  // clear: () => CategorizedTransactionRepo.delete({ type: TransactionType.CREDIT }),
  write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
    await getManager(manager).save(transactions.map(t =>
      new DAOTransaction({ ...t, transactionType: TransactionType.CREDIT })
    ))
  },
}

export const allActions = {
  clear: () => repo().clear(),
  write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
    await getManager(manager).save(transactions.map(t =>
      new DAOTransaction(t)
    ))
  }
}
