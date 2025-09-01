import { useContext, useEffect, useMemo, useState } from 'react'
import './ingestedData.css'
import { AppBar, Box, Paper, Tab, Tabs } from '@mui/material'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TabPanel } from '../tabPanel';
import { ICategorizedTransaction } from '@/server/services/transaction'

type Row = Omit<ICategorizedTransaction, 'metadata' | 'date'> & {
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
  accountType: i.accountType,
  permanentCategory: i.permanentCategory,
  permanentCategoryQuery: i.permanentCategoryQuery,
})

type IngestedDataProps = {
  debits: ICategorizedTransaction[],
  credits: ICategorizedTransaction[],
  uncategorizableDebits: ICategorizedTransaction[],
  categories: string[]
}

export const IngestedData = ({ categories, debits, credits, uncategorizableDebits }: IngestedDataProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [debitRows, setDebitRows] = useState<Row[]>([]);
  const [creditRows, setCreditRows] = useState<Row[]>([]);
  const [uncategorizableDebitRows, setUncategorizableDebitRows] = useState<Row[]>([]);
  const [categorizedDebits, setCategorizedDebits] = useState<ICategorizedTransaction[]>([]);

  console.count('ingestedata')
  
  useEffect(() => {
    setColumns([
      {
        field: 'category', headerName: 'Category',
        type: 'singleSelect',
        valueOptions: categories,
        editable: true,
        width: 200
      },
      {
        field: 'permanentCategory', headerName: 'PermanentCategory',
        type: 'singleSelect',
        valueOptions: categories,
        editable: true,
        width: 200
      },
      { field: 'amount', headerName: 'Amount' },
      { field: 'date', headerName: 'Date', type: 'date' },
      { field: 'description', headerName: 'Description', width: 400 },
      { field: 'bankType', headerName: 'BankType' },
      { field: 'transactionType', headerName: 'TransactionType' },
      { field: 'accountName', headerName: 'AccountName', width: 100 },
      { field: 'accountType', headerName: 'AccountType' },
      { field: 'checkNum', headerName: 'Check' },
      // { field: 'permanentCategoryQuery', headerName: 'PermanentCategoryQuery' },
    ])

    setDebitRows(debits.map(createRow));
    setCreditRows(credits.map(createRow));
    setUncategorizableDebitRows(uncategorizableDebits.map(createRow));

  }, [categories, credits, debits, uncategorizableDebits])

  // need to be able to do category and then permanentCategory. 

  const paginationModel = { page: 0, pageSize: 100 };

  const handleRowUpdate = (updatedRow: Row, originalRow: Row) => {
    setCategorizedDebits([
      ...(categorizedDebits.filter(d => getRowId(d) !== getRowId(originalRow))),
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

  return (
    <>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="secondary"
        textColor="inherit"
        aria-label="full width tabs example"
      >
        <Tab label="Debits" />
        <Tab label="Credits" />
        <Tab label="Uncategorizable" />
      </Tabs>

      {/* <TabPanel value={tabValue} index={0}>
        <DataGrid
          rows={debitRows}
          columns={columns}
          processRowUpdate={handleRowUpdate}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[50, 100]}
          density="compact"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <DataGrid
          rows={creditRows}
          columns={columns}
          processRowUpdate={handleRowUpdate}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[50, 100]}
          density="compact"
        />
      </TabPanel> */}

      <TabPanel value={tabValue} index={2}>
        <DataGrid
          rows={uncategorizableDebitRows}
          columns={columns}
          processRowUpdate={handleRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[50, 100]}
          density="compact"
        />
      </TabPanel>
    </>
  )
}