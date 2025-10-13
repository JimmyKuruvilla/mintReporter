
import { AccountType } from '../domains/transaction/accountType';
import { AccountDetails } from '../domains/account/accountDetails';
import { ChaseBankCSVParser, ChaseCreditCSVParser } from '../domains/account/chase';

export const ChaseIdToDetails: { [accountId: string]: AccountDetails } = {
    // test accounts
    '1234': { name: 'Checking', parser: ChaseBankCSVParser, type: AccountType.BANK },
    '5678': { name: 'Credit Card', parser: ChaseCreditCSVParser, type: AccountType.CREDIT },
  
    // add new account details here
    '8293': { name: 'Repeat Bills', parser: ChaseCreditCSVParser, type: AccountType.CREDIT },
    '3328': { name: 'Out and About', parser: ChaseCreditCSVParser, type: AccountType.CREDIT },
    '7327': { name: 'Out and About', parser: ChaseCreditCSVParser, type: AccountType.CREDIT }, // old, cancelled after ~Jun 2025
    '3491': { name: 'Out and About', parser: ChaseCreditCSVParser, type: AccountType.CREDIT }, // old, cancelled after Jun 29 2024
  
    '0465': { name: 'Checking', parser: ChaseBankCSVParser, type: AccountType.BANK },
    '0401': { name: 'Savings', parser: ChaseBankCSVParser, type: AccountType.BANK },
    '8286': { name: 'Abel', parser: ChaseBankCSVParser, type: AccountType.BANK },
    '9306': { name: 'Eli', parser: ChaseBankCSVParser, type: AccountType.BANK },
    '1553': { name: 'Car', parser: ChaseBankCSVParser, type: AccountType.BANK },
  }
  