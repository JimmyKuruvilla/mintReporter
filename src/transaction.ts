export interface Transaction {
  date: Date,
  description: string,
  amount: number,
  transactionType: string,
  category: string,
  accountName: string,
  notes?: string
}

export const Transaction = (
  date: string,
  description: string,
  amount: string,
  transactionType: string,
  category: string,
  accountName: string,
  notes?: string): Transaction => ({
    date: new Date(date),
    description,
    amount: parseFloat(amount),
    transactionType: transactionType.toLowerCase(),
    category,
    accountName,
    notes
  })

