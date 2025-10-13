import path from 'path';
import { EMPTY_FIELD, NEW_LINE } from '../../constants';
import { SvcTransaction, TransactionType, AccountType } from '../transaction';

/*
  problem1: 
  When a description contains a comma like this:
  DEBIT,10/25/2022,"GALVANIZE, INC.  ACH        585-739-7828    WEB ID: 5330903620",-8990.00,ACH_DEBIT,5905.21,,
  splitting on commas gets the wrong column data. 

  problem 2:
  sometimes chase omits a field like `a,,b` and the regex needs to account for that:

  const doubleQuotedOrNotCommaRegex = /"[^"]*"|[^,]+|,,/g;
  1. "[^"]*": anything that isn't a double quote inside a quoted string 
  2. [^,]+: any non-comma fixes 
  3. ,,: any 2 commas together - which happens when a field is omitted by chase. Ex: credit type:payment where the category is empty and bank transactions without check numbers.
*/
const doubleQuotedOrNotCommaRegex = /"[^"]*"|[^,]+|,,/g;

/*
chaseTypes
  transfers:
    - exclude ACCT_XFER to ignore moving money between accounts
    - exclude LOAN_PMT to ignore credit card payments

  payments:
    - ACH_DEBIT to handle payments from checking
    - CHASE_TO_PARTNERFI are Zelle outgoing payments (chase -> other bank)
    - QUICKPAY_DEBIT to handle Zelle outgoing payments, (chase -> chase)
    - CHECK are checks paid

  income:
    - PARTNERFI_TO_CHASE are Zelle incoming payments
    - ACH_CREDIT are paychecks and tax refunds
    - MISC_CREDIT are interest payments
    - DEPOSIT are usually credit card point redemption
*/

export const BANK_CREDIT_TYPES = ['ach_credit', 'deposit', 'check_deposit', 'partnerfi_to_chase', 'misc_credit',];
export const BANK_DEBIT_TYPES = ['ach_debit', 'deposit_return', 'atm', 'check_paid', 'chase_to_partnerfi', 'fee_transaction', 'debit_card', 'quickpay_debit', 'wire_outgoing'];
export const BANK_TRANSFER_TYPES = ['acct_xfer', 'loan_pmt'];
const CREDIT_CARD_AUTOPAY = 'CREDIT CRD AUTOPAY'
export const KNOWN_CHASE_BANK_TYPES = [...BANK_DEBIT_TYPES, ...BANK_CREDIT_TYPES, ...BANK_TRANSFER_TYPES];

export const CREDIT_CREDIT_TYPES = ['return'];
export const CREDIT_DEBIT_TYPES = ['sale', 'fee'];
export const CREDIT_TRANSFER_TYPES = ['payment'];
export const KNOWN_CHASE_CREDIT_TYPES = [...CREDIT_DEBIT_TYPES, ...CREDIT_CREDIT_TYPES, ...CREDIT_TRANSFER_TYPES];

const formatDescription = (description: string) => description.replace(/ +/g, ' ').replaceAll('&amp;', '_and_').replaceAll('*', ' ').replaceAll('"', '')

const getLineMatches = (line: string) => line.match(doubleQuotedOrNotCommaRegex)?.map(_ => _ === EMPTY_FIELD ? '' : _)

export const getChaseAccountId = (filename: string) => {
  const result = /.*Chase(?<lastFour>\d{4})_.+/.exec(path.basename(filename))

  return result?.groups?.lastFour
}

// headers: Transaction Date,Post Date,Description,Category,Type,Amount,Memo
export const ChaseCreditCSVParser = (accountName: string, csv: string): SvcTransaction[] => {
  const [headers, ...lines] = csv.split(NEW_LINE);
  return lines
    .filter(Boolean)
    .map(line => {
      const matches = getLineMatches(line);

      if (matches) {
        const [transactionDate, postDate, description, category, _type, amount, memo] = matches;
        const type = _type.toLowerCase()

        if (KNOWN_CHASE_CREDIT_TYPES.includes(type)) {
          let transactionType = CREDIT_TRANSFER_TYPES.includes(type)
            ? TransactionType.TRANSFER
            : CREDIT_CREDIT_TYPES.includes(type)
              ? TransactionType.CREDIT
              : TransactionType.DEBIT

          return new SvcTransaction({
            date: transactionDate,
            description: formatDescription(description),
            amount,
            transactionType,
            metadata: { chaseType: type, [AccountType.BANK]: { checkNumber: null }, [AccountType.CREDIT]: {} },
            accountName,
            accountType: AccountType.CREDIT,
            notes: memo
          })
        }
        else {
          throw new Error(`Found credit transaction with unknown type: ${type}`)
        }
      } else {
        throw new Error(`No matches found on credit line ${line}`)
      }
    })
}

const getBankTransactionType = (type: string, description: string): TransactionType => {
  if (BANK_TRANSFER_TYPES.includes(type) || description.includes(CREDIT_CARD_AUTOPAY)) {
    return TransactionType.TRANSFER
  } else {
    return BANK_CREDIT_TYPES.includes(type)
      ? TransactionType.CREDIT
      : TransactionType.DEBIT
  }
}

// headers: Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
// Details or transactionType: DEBIT or CREDIT
export const ChaseBankCSVParser = (accountName: string, csv: string): SvcTransaction[] => {
  const [headers, ...lines] = csv.split(NEW_LINE);
  return lines
    .filter(Boolean)
    .map(line => {
      const matches = getLineMatches(line);

      if (matches) {
        const [chaseTransactionType, postDate, description, amount, _type, balance, checkNumber] = matches;
        const type = _type.toLowerCase()

        if (KNOWN_CHASE_BANK_TYPES.includes(type)) {
          return new SvcTransaction({
            date: postDate,
            description: formatDescription(description),
            amount,
            transactionType: getBankTransactionType(type, description),
            metadata: { chaseType: type, [AccountType.BANK]: { checkNumber }, [AccountType.CREDIT]: {} },
            accountName,
            accountType: AccountType.BANK,
            notes: undefined
          })
        }
        else {
          throw new Error(`Found bank transaction with unknown type: ${type}`)
        }
      } else {
        throw new Error(`No matches found on bank line ${line}`)
      }
    })
}