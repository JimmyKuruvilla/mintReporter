import fs from 'fs';
import { chain } from 'lodash-es';
import { EntityManager } from 'typeorm';
import { AccountIdToDetails, uploadsFolder } from '../../config';
import { UTF8 } from '../../constants';
import { db } from '../../persistence/dataSource';
import { getChaseAccountId } from '../account/chase';
import { CategoryService } from '../category/category.service';
import { FileService } from '../file';
import { SvcReconciliation } from '../reconciliation/reconciliation';
import { DAOTransaction } from './dao.transaction';
import { SvcTransaction, SvcTransactionCtorArgs } from './svc.transaction';
import { TransactionType } from './transactionType';

const repo = () => db.getRepository(DAOTransaction)

const getManager = (manager?: EntityManager): any => {
  if (manager) {
    return manager
  } else {
    return repo()
  }
}

// TODO should this take FS and db as deps?
export class TransactionService {
  fileService!: FileService
  categoryService!: CategoryService
  accounts!: AccountIdToDetails

  constructor(data: { accounts: AccountIdToDetails, fileService: FileService, categoryService: CategoryService }) {
    Object.assign(this, data)
  }

  createInitialData = async (startDate: Date, endDate: Date, fileExts: string[]) => {
    console.log(`Running reports from ${startDate} to ${endDate} using ${fileExts}`)

    const allTransactions: SvcTransaction[] = []

    await this.fileService.traverse.recursive(uploadsFolder, fileExts, console, (path: string) => {
      const id = getChaseAccountId(path)
      if (id) {
        const csvTransactions = fs.readFileSync(path, { encoding: UTF8 });
        const account = this.accounts[id]

        console.log(`Processing ${path}`)
        const transactions = account.parser(account.name, csvTransactions)

        allTransactions.push(...transactions)
      } else {
        throw new Error(`Files without id found: ${path}`)
      }
    })

    const matchers = await this.categoryService.getAvailableMatchers()

    const transactions = chain(allTransactions)
      .filter(t => t.isWithinDateRange(startDate, endDate) && t.isNotTransfer())
      .map(t => t.assignCategory(matchers))
      .value()

    await this.allDbActions.write(transactions)
  }

  createTransactions = async (startDate: Date, endDate: Date) => {
    await this.createInitialData(new Date(startDate), new Date(endDate), ['.csv'])
    return this.createReconciliation()
  }

  editTransactions = async (editedDebits: SvcTransactionCtorArgs[], editedCredits: SvcTransactionCtorArgs[]) => {
    await this.debitDbActions.write(editedDebits.map(t => new SvcTransaction(t)))
    await this.crediDbActions.write(editedCredits.map(t => new SvcTransaction(t)))
    return this.createReconciliation()
  }

  createReconciliation = async () => {
    const debits = await this.debitDbActions.read()
    const credits = await this.crediDbActions.read()
    return new SvcReconciliation({ debits, credits }).calc()
  }

  deleteAllTransactions = async () => {
    return this.allDbActions.clear()
  }

  debitDbActions = {
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

  crediDbActions = {
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

  allDbActions = {
    clear: () => repo().clear(),
    write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
      await getManager(manager).save(transactions.map(t =>
        new DAOTransaction(t)
      ))
    }
  }
}
