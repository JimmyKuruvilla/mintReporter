import { useContext, useEffect, useMemo, useState } from 'react'
import './styles.css'
import { AppBar, Box, Button, Paper, Tab, Tabs } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TabPanel } from '../tabPanel';
import { ICategorizedTransaction } from '@/server/services/transaction'
import { fatch } from '../../utils/fatch';
import { TRANSACTION_TYPES } from '../../../../server/constants';
import { Inputs } from '../inputs';
import { ICombinedSummary } from '../../../../server/services/summary';

type TransactionRow = Omit<ICategorizedTransaction, 'permanentCategory' | 'permanentCategoryQuery' | 'metadata' | 'date'> & {
  id: number,
  date: Date,
  checkNum?: string,
  bankType?: string
}

type SummaryRow = {
  id: number,
  category: string
  amount: string
}

const getRowId = (row: ICategorizedTransaction | TransactionRow) => `${row.date?.toISOString?.() ?? row.date}-${row.amount}-${row.description}-${row.category}`

const createTransaction = (row: TransactionRow): ICategorizedTransaction => {
  const t: any = structuredClone(row)

  delete t.id
  delete t.checkNum
  delete t.bankType
  t.date = t.date.toISOString()

  t.metadata = {
    bank_account: { checkNumber: row.checkNum },
    chaseType: row.bankType,
  }

  return t
}

const createRow = (i: ICategorizedTransaction, index: number): TransactionRow => ({
  id: index,
  category: i.category,
  amount: i.amount,
  date: new Date(i.date),
  description: i.description,
  checkNum: i.metadata?.bank_account?.checkNumber,
  bankType: i.metadata?.chaseType,
  transactionType: i.transactionType,
  accountName: i.accountName,
  accountType: i.accountType
})

type IngestedDataProps = {
  setIngestedData: Function
  debits: ICategorizedTransaction[],
  credits: ICategorizedTransaction[],
  categories: string[]
  reconciledSummary: ICombinedSummary
}

export const IngestedData = ({ setIngestedData, categories, debits, credits, reconciledSummary }: IngestedDataProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [transactionColumns, setTransactionColumns] = useState<GridColDef[]>([]);
  const [reconciledColumns, setReconciledColumns] = useState<GridColDef[]>([]);

  const [reconciledRows, setReconciledRows] = useState<SummaryRow[]>([]);
  const [transactionDebitRows, setTransactionDebitRows] = useState<TransactionRow[]>([]);
  const [transactionCreditRows, setTransactionCreditRows] = useState<TransactionRow[]>([]);

  const [editedDebits, setEditedDebits] = useState<ICategorizedTransaction[]>([]);
  const [editedCredits, setEditedCredits] = useState<ICategorizedTransaction[]>([]);

  console.count('ingestedata')

  useEffect(() => {
    setReconciledColumns([
      { field: 'category', headerName: 'Category', width: 150 },
      { field: 'amount', headerName: 'Amount' },
    ])

    setReconciledRows(
      Object
        .entries(reconciledSummary)
        .map(([category, amount], index) => ({ id: index, category, amount: amount.toFixed(2) }))
    )

    setTransactionColumns([
      {
        field: 'category', headerName: 'Category',
        type: 'singleSelect',
        valueOptions: categories,
        editable: true,
        width: 150
      },
      { field: 'amount', headerName: 'Amount' },
      { field: 'date', headerName: 'Date', type: 'date' },
      { field: 'description', headerName: 'Description', width: 400 },
      { field: 'bankType', headerName: 'BankType' },
      { field: 'transactionType', headerName: 'TransactionType' },
      { field: 'accountName', headerName: 'AccountName', width: 100 },
      { field: 'accountType', headerName: 'AccountType' },
      { field: 'checkNum', headerName: 'Check' },
    ])

    setTransactionDebitRows(debits.map(createRow));
    setTransactionCreditRows(credits.map(createRow));

  }, [categories, credits, debits])

  const paginationModel = { page: 0, pageSize: 10 };
  const reconciledPaginationModel = { page: 0, pageSize: 100 };

  const handleCreditRowUpdate = (updatedRow: TransactionRow, originalRow: TransactionRow) => {
    setEditedCredits([
      ...(editedCredits.filter(d => getRowId(d) !== getRowId(originalRow))),
      createTransaction(updatedRow)
    ])
    return updatedRow
  }

  const handleDebitRowUpdate = (updatedRow: TransactionRow, originalRow: TransactionRow) => {
    setEditedDebits([
      ...(editedDebits.filter(d => getRowId(d) !== getRowId(originalRow))),
      createTransaction(updatedRow)
    ])
    return updatedRow
  }

  const handleProcessRowUpdateError = (error: any) => {
    console.log(error)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveEdits = () => {
    const hasValidationError = [...editedCredits, ...editedDebits].some(row => {
      if (row.permanentCategory || row.permanentCategoryQuery) {
        return !(row.permanentCategory && row.permanentCategoryQuery)
      }
      return false
    })

    if (hasValidationError) {
      console.error('One row missing perma category or perma query')
    } else {
      fatch(
        { path: 'inputs', method: 'patch', body: { editedDebits, editedCredits } }
      ).then(data => {
        setEditedCredits([])
        setEditedDebits([])
        setTransactionDebitRows(data.debits.map(createRow))
        setTransactionCreditRows(data.credits.map(createRow))
      })
    }
  }

  return (
    <>
      <Inputs setIngestedData={setIngestedData}></Inputs>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="secondary"
        textColor="inherit"
      >
        <Tab label="Debits" />
        <Tab label="Credits" />
        <Tab label="Reconciled" />
      </Tabs>

      <Button
        variant="contained"
        sx={{ margin: '10px 10px 10px 0' }}
        onClick={handleSaveEdits}
      >
        Save
      </Button>

      <TabPanel value={tabValue} index={0}>
        <DataGrid
          rows={transactionDebitRows}
          columns={transactionColumns}
          processRowUpdate={handleDebitRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 1000]}
          density="compact"
          showToolbar
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <DataGrid
          rows={transactionCreditRows}
          columns={transactionColumns}
          processRowUpdate={handleCreditRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 1000]}
          density="compact"
          showToolbar
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <DataGrid
          rows={reconciledRows}
          columns={reconciledColumns}
          initialState={{ pagination: { paginationModel: reconciledPaginationModel } }}
          pageSizeOptions={[10, 1000]}
          density="compact"
          showToolbar
        />
      </TabPanel>
    </>
  )
}

// start with reconciled. when updating a category, the recalculated values should update hte reconciled.