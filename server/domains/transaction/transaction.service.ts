import fs from 'fs';
import { chain } from 'lodash-es';
import { EntityManager, Repository } from 'typeorm';
import { AccountIdToDetails, uploadsFolder } from '../../config';
import { UTF8 } from '../../constants';
import { db } from '../../persistence/dataSource';
import { getChaseAccountId } from '../account/chase';
import { CategoryService } from '../category/category.service';
import { FileService } from '../file';
import { SvcReconciliation } from '../reconciliation/reconciliation';
import { DAOHistoricalTransaction } from './dao.historicalTransaction';
import { DAOTransaction } from './dao.transaction';
import { SvcTransaction, SvcTransactionCtorArgs } from './svc.transaction';
import { TransactionType } from './transactionType';

const getManager = (manager?: EntityManager): any => {
  if (manager) {
    return manager
  } else {
    return db.getRepository(DAOTransaction)
  }
}

export class TransactionService {
  repository!: Repository<DAOTransaction>
  historicalTransactionRepository!: Repository<DAOHistoricalTransaction>
  fileService!: FileService
  categoryService!: CategoryService
  accounts!: AccountIdToDetails

  constructor(data: {
    repository: Repository<DAOTransaction>,
    historicalTransactionRepository: Repository<DAOHistoricalTransaction>,
    accounts: AccountIdToDetails,
    fileService: FileService,
    categoryService: CategoryService
  }) {
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

    await this.db.current.writeAny(transactions)
  }

  createTransactions = async (startDate: Date, endDate: Date) => {
    await this.createInitialData(new Date(startDate), new Date(endDate), ['.csv'])
    return this.createReconciliation()
  }

  editTransactions = async (editedDebits: SvcTransactionCtorArgs[], editedCredits: SvcTransactionCtorArgs[]) => {
    await this.db.current.debit.write(editedDebits.map(t => new SvcTransaction(t)))
    await this.db.current.credit.write(editedCredits.map(t => new SvcTransaction(t)))
    return this.createReconciliation()
  }

  createReconciliation = async () => {
    const debits = await this.db.current.debit.read()
    const credits = await this.db.current.credit.read()
    return new SvcReconciliation({ debits, credits }).calc()
  }

  deleteAllTransactions = async () => {
    return this.db.current.clear()
  }

  createHistoricalReconciliation = async (startDate: Date, endDate: Date) => {
    const debits = await this.db.historical.debit.read()
    const credits = await this.db.historical.credit.read()
    return new SvcReconciliation({ debits, credits }).calc()
  }

  copyCurrentToHistory = (startDate: Date, endDate: Date) => { // TODO add copy fn. 
    console.log(`copying from ${startDate} to ${endDate} to historical table`)
  }

  db = {
    current: {
      clear: () => this.repository.clear(),

      writeAny: async (transactions: SvcTransaction[], manager?: EntityManager) => {
        await getManager(manager).save(transactions.map(t =>
          new DAOTransaction(t)
        ))
      },

      // TODO date range
      copy: (startDate: Date, endDate: Date) => { // TODO add copy fn. 
        console.log(`copying from ${startDate} to ${endDate} to historical table`)
      },

      debit: {
        read: async (): Promise<SvcTransaction[]> => {
          return (await this.repository.find({ where: { type: TransactionType.DEBIT } })).map(m => m.toSvc())
        },
        write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
          await getManager(manager).save(transactions.map(t =>
            new DAOTransaction({ ...t, transactionType: TransactionType.DEBIT })
          ))
        },
      },
      credit: {
        read: async (): Promise<SvcTransaction[]> => {
          return (await this.repository.find({ where: { type: TransactionType.CREDIT } })).map(m => m.toSvc())
        },
        write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
          await getManager(manager).save(transactions.map(t =>
            new DAOTransaction({ ...t, transactionType: TransactionType.CREDIT })
          ))
        },
      },
    },
    historical: {
      debit: {
        read: async (): Promise<SvcTransaction[]> => {
          return (await this.historicalTransactionRepository.find({ where: { type: TransactionType.DEBIT } })).map(m => m.toSvc())
        },
        write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
          await getManager(manager).save(transactions.map(t =>
            new DAOTransaction({ ...t, transactionType: TransactionType.DEBIT })
          ))
        },
      },
      credit: {
        read: async (): Promise<SvcTransaction[]> => {
          return (await this.historicalTransactionRepository.find({ where: { type: TransactionType.DEBIT } })).map(m => m.toSvc())
        },
        write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
          await getManager(manager).save(transactions.map(t =>
            new DAOTransaction({ ...t, transactionType: TransactionType.DEBIT })
          ))
        },
      }
    },
  }
}
