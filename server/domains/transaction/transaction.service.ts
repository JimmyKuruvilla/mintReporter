import fs from 'fs';
import { chain } from 'lodash-es';
import { ChaseIdToDetails, uploadsFolder } from '../../config';
import { UTF8 } from '../../constants';
import { Persistence } from '../../persistence/persistence';
import { getChaseAccountId } from '../account/chase';
import { SvcTransaction } from './svc.transaction';
import { getAvailableMatchers } from '../category';

export const createInitialData = async (startDate: Date, endDate: Date, fileExts: string[]) => {
  console.log(`Running reports from ${startDate} to ${endDate} using ${fileExts}`)

  const allTransactions: SvcTransaction[] = []

  await Persistence.file.traverse.recursive(uploadsFolder, fileExts, console, (path: string) => {
    const id = getChaseAccountId(path)
    if (id) {
      const csvTransactions = fs.readFileSync(path, { encoding: UTF8 });
      const account = ChaseIdToDetails[id]

      console.log(`Processing ${path}`)
      const transactions = account.parser(account.name, csvTransactions)

      allTransactions.push(...transactions)
    } else {
      throw new Error(`Files without id found: ${path}`)
    }
  })

  const matchers = await getAvailableMatchers()

  const transactions = chain(allTransactions)
    .filter(t => t.isWithinDateRange(startDate, endDate) && t.isNotTransfer())
    .map(t => t.assignCategory(matchers))
    .value()

  await Persistence.transactions.all.write(transactions)
}