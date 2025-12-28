import fs from 'fs';
import { chain } from 'lodash-es';
import { EntityManager, Repository } from 'typeorm';
import { AccountIdToDetails, uploadsFolder } from '../../config';
import { MAX_DATE, MIN_DATE, UTF8 } from '../../constants';
import { InvalidDateError } from '../../errors/invalidDateError';
import { db } from '../../persistence/dataSource';
import { isValidDate } from '../../utils/isValidDate';
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

  private createInitialData = async (startDate: Date, endDate: Date, fileExts: string[]) => {
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

  private getDateRange = (_startDate: string, _endDate: string) => {
    const startDate = new Date(_startDate)
    const endDate = new Date(_endDate)
    if (!(isValidDate(startDate) && isValidDate(endDate))) {
      throw new InvalidDateError(_startDate, _endDate)
    } else {
      return { startDate, endDate }
    }
  }

  createTransactions = async (_startDate: string = MIN_DATE, _endDate: string = MAX_DATE) => {
    const { startDate, endDate } = this.getDateRange(_startDate, _endDate)

    await this.createInitialData(startDate, endDate, ['.csv'])
    return this.createReconciliation()
  }

  editTransactions = async (editedDebits: SvcTransactionCtorArgs[], editedCredits: SvcTransactionCtorArgs[]) => {
    await this.db.current.debit.write(editedDebits.map(t => new SvcTransaction(t)))
    await this.db.current.credit.write(editedCredits.map(t => new SvcTransaction(t)))
    return this.createReconciliation()
  }

  createReconciliation = async (_startDate: string = MIN_DATE, _endDate: string = MAX_DATE) => {
    const { startDate, endDate } = this.getDateRange(_startDate, _endDate)

    const debits = await this.db.current.debit.read(startDate, endDate)
    const credits = await this.db.current.credit.read(startDate, endDate)
    return new SvcReconciliation({ debits, credits }).calc()
  }

  createHistoricalReconciliation = async (_startDate: string = MIN_DATE, _endDate: string = MAX_DATE) => {
    const { startDate, endDate } = this.getDateRange(_startDate, _endDate)

    const debits = await this.db.historical.debit.read(startDate, endDate)
    const credits = await this.db.historical.credit.read(startDate, endDate)
    return new SvcReconciliation({ debits, credits }).calc()
  }

  deleteCurrentByDateRange = async (_startDate: string = MIN_DATE, _endDate: string = MAX_DATE) => {
    const { startDate, endDate } = this.getDateRange(_startDate, _endDate)

    return this.db.current.deleteByDateRange(startDate, endDate)
  }

  /**
   * Copies the working set of transactions to the history table
   * The startdate is inclusive, and the end date is exclusive. The FE sends +1 day to capture full months
   */
  copyCurrentToHistory = async (startDate: string = MIN_DATE, endDate: string = MAX_DATE) => {
    return this.db.current.copyToHistory(startDate, endDate)
  }

  db = {
    current: {
      clear: () => this.repository.clear(),
      deleteByDateRange: (startDate: Date, endDate: Date) => {
        return this.repository
          .createQueryBuilder()
          .where(`date BETWEEN :startDate AND :endDate`, { startDate, endDate })
          .delete()
          .execute()
      },

      writeAny: async (transactions: SvcTransaction[], manager?: EntityManager) => {
        await getManager(manager).save(transactions.map(t =>
          new DAOTransaction(t)
        ))
      },

      copyToHistory: async (startDate: string, endDate: string) => {
        const columns = `category, date, amount, type, description, accountName, accountType, institutionTransactionType, checkNumber, notes`
        const sql = `
          INSERT INTO historical_transaction (${columns})
          SELECT ${columns}
          FROM "${this.repository.metadata.tableName}"
          where date BETWEEN ? and ?;
        `;
        await db.manager.transaction(async (manager) => {
          await manager.query(sql, [startDate, endDate])
        })
      },

      debit: {
        read: async (startDate: Date, endDate: Date): Promise<SvcTransaction[]> => {
          return (
            await this.repository
              .createQueryBuilder()
              .where(`type = :type`, { type: TransactionType.DEBIT })
              .andWhere(`date BETWEEN :startDate AND :endDate`, { startDate, endDate })
              .getMany()
          ).map((m: DAOTransaction) => m.toSvc())
        },
        write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
          await getManager(manager).save(transactions.map(t =>
            new DAOTransaction({ ...t, transactionType: TransactionType.DEBIT })
          ))
        },
      },
      credit: {
        read: async (startDate: Date, endDate: Date): Promise<SvcTransaction[]> => {
          return (
            await this.repository
              .createQueryBuilder()
              .where(`type = :type`, { type: TransactionType.CREDIT })
              .andWhere(`date BETWEEN :startDate AND :endDate`, { startDate, endDate })
              .getMany()
          ).map((m: DAOTransaction) => m.toSvc())
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
        read: async (startDate: Date, endDate: Date): Promise<SvcTransaction[]> => {
          return (
            await this.historicalTransactionRepository
              .createQueryBuilder()
              .where(`type = :type`, { type: TransactionType.DEBIT })
              .andWhere(`date BETWEEN :startDate AND :endDate`, { startDate, endDate })
              .getMany()
          ).map((m: DAOTransaction) => m.toSvc())
        },
        write: async (transactions: SvcTransaction[], manager?: EntityManager) => {
          await getManager(manager).save(transactions.map(t =>
            new DAOTransaction({ ...t, transactionType: TransactionType.DEBIT })
          ))
        },
      },
      credit: {
        read: async (startDate: Date, endDate: Date): Promise<SvcTransaction[]> => {
          return (
            await this.historicalTransactionRepository
              .createQueryBuilder()
              .where(`type = :type`, { type: TransactionType.CREDIT })
              .andWhere(`date BETWEEN :startDate AND :endDate`, { startDate, endDate })
              .getMany()
          ).map((m: DAOTransaction) => m.toSvc())
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
