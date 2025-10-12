IGNORED 
Means it is a category that shouldn't be considered because it is just moving money from one place to another. Like paying a credit card bill. 
Recurring work payments for internet should be counted as `reimbursements`, and the expense counted as an expense. Larger single purchases should be counted as `work` on the expense and income side so that they don't affect any trends. 

Uncategorizable Debits 
Means the transaction's category didn't fall into any of the available umbrella categories. They need categorization, otherwise they will not be reflected in the final output. Add additional mappings from the uncategory to an existing umbrella. 
- run stage 1
- run stage 2 to get all uncategorizable
- - update all permanent and one time categories
- - run stage 2 to write csvs with modified categories
- - review new categorization and overwrite base.json with it

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

Override category can be specified in the csv as the last column to one-time alter a category of a transaction.


Usage
- update dates in package.json
- run stage 1 to get partial output
- edit the data/initial/debits.uncategorizable to add a one time category or a permanent category with a query
- any category changes will be overwritten by rerunning stage 1!
- run stage 2 to 
 1. see which transactions are still uncategorizable after edits
 2. generate the final summaries and the modified base with updated permanent categories
- review the modifiedBase and copy it over to base to make changes permanent.
- stage2 will also report any Checks found. Update debits.all.json with categories to categorize the checks
- Ignore only works when updated in summary.ts because we don't want it in the final summary csv. 

UI Usage is very similar just less error prone and obvious

Bugs:
fragment: american (american airlines) matches t.description: American Meadows. Fixed as a one time update. Solution is American airlines needs to be more specific. 


TODO
2. highlight the uncategorized in the reconciled summary. 
2. persist records to db, and update service to use db models
reorganize into domains
- inputs/transactions the routes, types, daos in one place 
- etc. 

add tests vitest
add pino logger
add eslint
add backup to s3 script
add ability to ingest historical csv from sheets and turn it into a data archive
add graphs?

// use effect Ts /neverthrow at that point. 