import { db } from '../db';
import { Transaction } from './transaction.entity';

const TransactionRepo = db.getRepository(Transaction)

export const debitActions = {
    // read: () => TransactionRepo.find({ where: { type: FINAL } }),
    // clear: () => TransactionRepo.delete({ type: FINAL }),
    // write: async (matchers: Transaction[]) => {
      // await Persistence.matchers.final.clear()
      // await TransactionRepo.save(matchers.map(m => {
      //   m.type = FINAL;
      //   m.id = undefined
      //   return m
      // }))
    // },
}
export const creditActions = {}