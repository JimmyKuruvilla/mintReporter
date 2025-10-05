import { ICategorizedTransaction } from '@/server/services/transaction';
import { Button, IconButton, Tab, Tabs } from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { IReconciledSummary } from '../../../../server/services/summary';
import { fatch } from '../../utils/fatch';
import { TabPanel } from '../shared/tabPanel';
import { DateSelector } from './dateSelector';
import './styles.css';

type TransactionRow = Omit<ICategorizedTransaction, 'metadata' | 'date'> & {
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

type CalculatedData = {
  debits: ICategorizedTransaction[]
  credits: ICategorizedTransaction[]
  reconciledSummary: IReconciledSummary
}

type InputsLoaderData = CalculatedData & {
  categories: string[]
}

const getRowId = (row: ICategorizedTransaction | TransactionRow) => `${row.date?.toISOString?.() ?? row.date}-${row.amount}-${row.description}-${row.category}`

const createCategorizedTransactionFromRow = (row: TransactionRow): ICategorizedTransaction => {
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

const createTransactionRow = (i: ICategorizedTransaction, index: number): TransactionRow => ({
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

const createReconciledRows = (reconciledSummary: IReconciledSummary) =>
  Object
    .entries(reconciledSummary)
    .map(([category, amount], index) => ({ id: index, category, amount: amount?.toFixed(2) }))


export const Inputs = () => {
  const { categories, debits, credits, reconciledSummary }: InputsLoaderData = useLoaderData();
  const [tabValue, setTabValue] = useState(0);
  const [transactionColumns, setTransactionColumns] = useState<GridColDef[]>([
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
  ]);

  const [reconciledColumns, setReconciledColumns] = useState<GridColDef[]>([
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'amount', headerName: 'Amount' },
  ]);

  const [reconciledRows, setReconciledRows] = useState<SummaryRow[]>(() => createReconciledRows(reconciledSummary));
  const [transactionDebitRows, setTransactionDebitRows] = useState<TransactionRow[]>(() => debits.map(createTransactionRow));
  const [transactionCreditRows, setTransactionCreditRows] = useState<TransactionRow[]>(() => credits.map(createTransactionRow));

  const [editedDebits, setEditedDebits] = useState<ICategorizedTransaction[]>([]);
  const [editedCredits, setEditedCredits] = useState<ICategorizedTransaction[]>([]);

  const hasChanges = () => editedCredits.length > 0 || editedDebits.length > 0

  const updateCalculated = (data: CalculatedData) => {
    setEditedCredits([])
    setEditedDebits([])
    setTransactionDebitRows(data.debits.map(createTransactionRow))
    setTransactionCreditRows(data.credits.map(createTransactionRow))
    setReconciledRows(createReconciledRows(data.reconciledSummary))
  }

  const handleCreditRowUpdate = (updatedRow: TransactionRow, originalRow: TransactionRow) => {
    setEditedCredits([
      ...(editedCredits.filter(d => getRowId(d) !== getRowId(originalRow))),
      createCategorizedTransactionFromRow(updatedRow)
    ])
    return updatedRow
  }

  const handleDebitRowUpdate = (updatedRow: TransactionRow, originalRow: TransactionRow) => {
    setEditedDebits([
      ...(editedDebits.filter(d => getRowId(d) !== getRowId(originalRow))),
      createCategorizedTransactionFromRow(updatedRow)
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
    fatch({ path: 'inputs', method: 'patch', body: { editedDebits, editedCredits } }).then(updateCalculated)
  }

  const paginationModel = { page: 0, pageSize: 10 };
  const reconciledPaginationModel = { page: 0, pageSize: 100 };

  return (
    <div className='inputs'>
      <DateSelector updateCalculated={updateCalculated}></DateSelector>

      <div className='tabs'>
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

        <IconButton
          sx={{ margin: '10px 10px 10px 0' }}
          color={hasChanges() ? "secondary" : "primary"}
          onClick={handleSaveEdits}
        >
          <SaveOutlinedIcon />
        </IconButton>

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
            disableRowSelectionOnClick
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
            disableRowSelectionOnClick
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <DataGrid
            rows={reconciledRows}
            columns={reconciledColumns}
            initialState={{ pagination: { paginationModel: reconciledPaginationModel } }}
            pageSizeOptions={[10, 100]}
            density="compact"
            showToolbar
            disableRowSelectionOnClick
          />
        </TabPanel>
      </div>
    </div>
  )
}