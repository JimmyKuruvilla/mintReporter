IGNORED 
Means it is a category that shouldn't be considered because it is just moving money from one place to another. Like paying a credit card bill. 
Recurring work payments for internet should be counted as `reimbursements`, and the expense counted as an expense. Larger single purchases should be counted as `work` on the expense and income side so that they don't affect any trends. 

Uncategorizable Debits 
Means the transaction's category didn't fall into any of the available umbrella categories. They need categorization, otherwise they will not be reflected in the final output. Add additional mappings from the uncategory to an existing umbrella. 

Uncategorizable credits
There will be uncategorizable credits in the debug output. That is expected and does not affect total income calculation. There just isn't a need to categorize income categories.

Expense categories are reconciled (debits+credits) and so is the `Net` value. However `Total Outgoing` and `Total Incoming` are unreconciled sums representing the full movement of money. 


Total Incoming + Total Outgoing
- Supposed to represent the total flow of cash you might see in the bank accounts. Does not represent real spending trends as it includes medical reimbursements, shopping returns, work reimbursements etc. 

Pure Income [manual]
- Only income and tax returns. The idea is to show what money was actually earned this month. 

Reconciled Expenses
- All expenses + and - added together for each category. This works great for shopping returns as they happen within the same month and so this *should* represent a real total spent in a given month. 
- However large medical reimbursements can break this measurement because -1000 medical + 1500 medical reimbursement looks like we made +500 in medical. 
- One option to fix this is to break reimbursements into their own bucket and handle them on a yearly basis with medical costs to see the real cost of health care. This is too much work for now.

Net
- this is supposed to be pure income - reconciled expenses. In reality it suffers from the same problems when a large medical reimbursement hits. It looks like the Net is actually better than it is. Probably should just ignore this number. 
