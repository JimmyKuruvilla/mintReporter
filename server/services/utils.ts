import { CHECK, IGNORE, UNCATEGORIZABLE } from '../constants';
import { TransactionType } from '../persistence/entity/transaction';
import { ICategorizedTransaction, ITransaction } from './transaction';

export const isUncategorizable = (i: { category: string }) => i.category === UNCATEGORIZABLE

export const isUncategorizableOrCheck = (i: { category: string }) => isUncategorizable(i) || i.category === CHECK

export const isNotTransfer = (transaction: ITransaction) => transaction.transactionType !== TransactionType.TRANSFER

export const isDebit = (transaction: ITransaction) => transaction.transactionType === TransactionType.DEBIT

export const isIgnore = (transaction: ICategorizedTransaction) => transaction.category === IGNORE

export const isNotIgnore = (transaction: ICategorizedTransaction) => !isIgnore(transaction)