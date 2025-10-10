import { CHECK, IGNORE, UNCATEGORIZABLE } from '../constants';
import { TransactionType } from '../persistence/transaction/transaction.entity';
import { ICategorizedTransactionDTO, ITransactionDTO } from './transaction';

export const isUncategorizable = (i: { category: string }) => i.category === UNCATEGORIZABLE

export const isUncategorizableOrCheck = (i: { category: string }) => isUncategorizable(i) || i.category === CHECK

export const isNotTransfer = (transaction: ITransactionDTO) => transaction.transactionType !== TransactionType.TRANSFER

export const isDebit = (transaction: ITransactionDTO) => transaction.transactionType === TransactionType.DEBIT

export const isIgnore = (transaction: ICategorizedTransactionDTO) => transaction.category === IGNORE

export const isNotIgnore = (transaction: ICategorizedTransactionDTO) => !isIgnore(transaction)