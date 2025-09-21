import { useContext, useEffect, useMemo, useState } from 'react'
import './styles.css'
import { AppBar, Box, Button, Paper, Tab, Tabs } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TabPanel } from '../tabPanel';
import { ICategorizedTransaction } from '@/server/services/transaction'
import { fatch } from '../../utils/fatch';
import { TRANSACTION_TYPES } from '../../../../server/constants';
import { Inputs } from '../inputs';

type Row = Omit<ICategorizedTransaction, 'permanentCategory' | 'permanentCategoryQuery' | 'metadata' | 'date'> & {
  id: number,
  date: Date,
  checkNum?: string,
  bankType?: string
}

const getRowId = (row: ICategorizedTransaction | Row) => `${row.date?.toISOString?.() ?? row.date}-${row.amount}-${row.description}-${row.category}`

const createTransaction = (row: Row): ICategorizedTransaction => {
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

const createRow = (i: ICategorizedTransaction, index: number): Row => ({
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
}

export const IngestedData = ({ setIngestedData, categories, debits, credits }: IngestedDataProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [debitRows, setDebitRows] = useState<Row[]>([]);
  const [creditRows, setCreditRows] = useState<Row[]>([]);
  const [editedDebits, setEditedDebits] = useState<ICategorizedTransaction[]>([]);
  const [editedCredits, setEditedCredits] = useState<ICategorizedTransaction[]>([]);

  console.count('ingestedata')

  useEffect(() => {
    setColumns([
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

    setDebitRows(debits.map(createRow));
    setCreditRows(credits.map(createRow));

  }, [categories, credits, debits])

  const paginationModel = { page: 0, pageSize: 10 };

  const handleCreditRowUpdate = (updatedRow: Row, originalRow: Row) => {
    setEditedCredits([
      ...(editedCredits.filter(d => getRowId(d) !== getRowId(originalRow))),
      createTransaction(updatedRow)
    ])
    return updatedRow
  }

  const handleDebitRowUpdate = (updatedRow: Row, originalRow: Row) => {
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
        { path: 'edits', method: 'post', body: { editedDebits, editedCredits } }
      ).then(data => {
        setEditedCredits([])
        setEditedDebits([])
        setDebitRows(data.debits.map(createRow))
        setCreditRows(data.credits.map(createRow))
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
          rows={debitRows}
          columns={columns}
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
          rows={creditRows}
          columns={columns}
          processRowUpdate={handleCreditRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10, 1000]}
          density="compact"
          showToolbar
        />
      </TabPanel>
    </>
  )
}