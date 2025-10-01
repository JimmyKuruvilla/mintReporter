import { AccountDetails, Accounts } from '../services/account';
import { ChaseBankCSVParser, ChaseCreditCSVParser } from '../services/chase';

export const ChaseIdToDetails: { [accountId: string]: AccountDetails } = {
    // test accounts
    '1234': { name: 'Checking', parser: ChaseBankCSVParser, type: Accounts.BANK },
    '5678': { name: 'Credit Card', parser: ChaseCreditCSVParser, type: Accounts.CREDIT },
  
    // add new account details here
    '8293': { name: 'Repeat Bills', parser: ChaseCreditCSVParser, type: Accounts.CREDIT },
    '3328': { name: 'Out and About', parser: ChaseCreditCSVParser, type: Accounts.CREDIT },
    '7327': { name: 'Out and About', parser: ChaseCreditCSVParser, type: Accounts.CREDIT }, // old, cancelled after ~Jun 2025
    '3491': { name: 'Out and About', parser: ChaseCreditCSVParser, type: Accounts.CREDIT }, // old, cancelled after Jun 29 2024
  
    '0465': { name: 'Checking', parser: ChaseBankCSVParser, type: Accounts.BANK },
    '0401': { name: 'Savings', parser: ChaseBankCSVParser, type: Accounts.BANK },
    '8286': { name: 'Abel', parser: ChaseBankCSVParser, type: Accounts.BANK },
    '9306': { name: 'Eli', parser: ChaseBankCSVParser, type: Accounts.BANK },
    '1553': { name: 'Car', parser: ChaseBankCSVParser, type: Accounts.BANK },
  }
  