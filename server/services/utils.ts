import { CHECK, IGNORE, UNCATEGORIZABLE } from '../constants';
import { TransactionType } from '../persistence/transaction/transaction.dao';
import { ISvcCategorizedTransactionDTO, ISvcTransactionDTO } from './svcTransaction';

export const isUncategorizable = (i: { category: string }) => i.category === UNCATEGORIZABLE

export const isUncategorizableOrCheck = (i: { category: string }) => isUncategorizable(i) || i.category === CHECK

export const isNotTransfer = (transaction: ISvcTransactionDTO) => transaction.transactionType !== TransactionType.TRANSFER

export const isDebit = (transaction: ISvcTransactionDTO) => transaction.transactionType === TransactionType.DEBIT

export const isIgnore = (transaction: ISvcCategorizedTransactionDTO) => transaction.category === IGNORE

export const isNotIgnore = (transaction: ISvcCategorizedTransactionDTO) => !isIgnore(transaction)