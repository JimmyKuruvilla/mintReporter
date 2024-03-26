import path from 'path';
import { AccountDetails, ACCOUNTS } from './accounts';
import { Transaction } from './transaction';
import { DEBIT, NEW_LINE } from './constants';

const doubleQuotedOrNotCommaRegex = /"[^"]*"|[^,]+/g;

export const getChaseAccountId = (filename: string) => {
  const result = /.*Chase(?<lastFour>\d{4})_.+/.exec(path.basename(filename))

  return result?.groups?.lastFour
}

// headers: Transaction Date,Post Date,Description,Category,Type,Amount,Memo
const ChaseCreditCSVParser = (accountName: string, csv: string): Transaction[] => {
  const [headers, ...lines] = csv.split(NEW_LINE);
  return lines
    .filter(Boolean)
    .map(line => {
      const matches = line.match(doubleQuotedOrNotCommaRegex)
      if (matches) {
        const [transactionDate, postDate, description, category, type, amount, memo] = matches

        // temporary until we find out what other types exist, maybe refund/credit?
        if (type.toLowerCase() === 'sale') {
          let transactionType = DEBIT

          return Transaction(
            transactionDate,
            description,
            amount,
            transactionType,
            category,
            accountName,
            memo
          )
        }
        else {
          throw new Error(`Found transaction with non-sale type: ${type}`)
        }
      } else {
        throw new Error(`No matches on line: ${line}`)
      }
    })
}

// headers: Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
// transactionType or details: DEBIT (outgoing) or CREDIT (incoming)
// chaseTypes: MISC_CREDIT, ACCT_XFER, ACH_DEBIT and others
const ChaseBankCSVParser = (accountName: string, csv: string): Transaction[] => {
  const [headers, ...lines] = csv.split(NEW_LINE);
  return lines
    .filter(Boolean)
    .map(line => {
      const matches = line.match(doubleQuotedOrNotCommaRegex)
      if (matches) {

        const [transactionType, postDate, description, amount, chaseType, balance, checkNumber] = matches.map(_ => _.replace(/"/g, ''));

        return Transaction(
          postDate,
          description,
          amount,
          transactionType,
          chaseType,
          accountName,
          checkNumber
        )
      }
      else {
        throw new Error(`No matches on line: ${line}`)
      }
    })
}


export const ChaseIdToDetails: { [accountId: string]: AccountDetails } = {
  '8293': { name: 'Repeat Bills', parser: ChaseCreditCSVParser, type: ACCOUNTS.CREDIT },
  '3491': { name: 'Out and About', parser: ChaseCreditCSVParser, type: ACCOUNTS.CREDIT },

  '0465': { name: 'Checking', parser: ChaseBankCSVParser, type: ACCOUNTS.BANK },
  '0401': { name: 'Savings', parser: ChaseBankCSVParser, type: ACCOUNTS.BANK },
  '8286': { name: 'Abel', parser: ChaseBankCSVParser, type: ACCOUNTS.BANK },
  '9306': { name: 'Eli', parser: ChaseBankCSVParser, type: ACCOUNTS.BANK },
  '1553': { name: 'Car Replacement', parser: ChaseBankCSVParser, type: ACCOUNTS.BANK },
}
