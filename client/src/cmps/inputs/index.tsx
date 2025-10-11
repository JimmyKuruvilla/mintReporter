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
import { SvcTransactionCtorArgs, UiTransaction } from '../../../../server/services';

type SummaryRow = {
  id: number,
  category: string
  amount: string
}

type CalculatedData = {
  debits: UiTransaction[]
  credits: UiTransaction[]
  reconciledSummary: IReconciledSummary
}

type InputsLoaderData = CalculatedData & {
  categories: string[]
}

const createEdit = (row: UiTransaction): SvcTransactionCtorArgs => {
  const t = structuredClone(row) as any

  delete t.checkNum
  delete t.bankType
  t.date = t.date.toISOString()

  t.metadata = {
    bank_account: { checkNumber: row.checkNum },
    chaseType: row.bankType,
  }

  return t
}

const createTransactionRow = (i: SvcTransactionCtorArgs): UiTransaction => ({
  id: i.id,
  category: i.category,
  amount: i.amount,
  date: new Date(i.date),
  description: i.description,
  checkNum: i.metadata?.bank_account?.checkNumber,
  bankType: i.metadata?.chaseType,
  transactionType: i.transactionType,
  accountName: i.accountName,
  accountType: i.accountType,
  metadata: i.metadata
})

const createReconciledRows = (reconciledSummary: IReconciledSummary) =>
  Object
    .entries(reconciledSummary)
    .map(([category, amount], index) => ({ id: index, category, amount: amount?.toFixed(2) }))


export const Inputs = () => {
  const { categories, debits, credits, reconciledSummary }: InputsLoaderData = useLoaderData();
  const [tabValue, setTabValue] = useState(0);
  const [transactionColumns, setTransactionColumns] = useState<GridColDef[]>([
    { field: 'id', headerName: 'Id' },
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
  const [transactionDebitRows, setTransactionDebitRows] = useState<UiTransaction[]>(() => debits.map(createTransactionRow));
  const [transactionCreditRows, setTransactionCreditRows] = useState<UiTransaction[]>(() => credits.map(createTransactionRow));

  const [editedDebits, setEditedDebits] = useState<SvcTransactionCtorArgs[]>([]);
  const [editedCredits, setEditedCredits] = useState<SvcTransactionCtorArgs[]>([]);

  const hasChanges = () => editedCredits.length > 0 || editedDebits.length > 0

  const updateCalculated = (data: CalculatedData) => {
    setEditedCredits([])
    setEditedDebits([])
    setTransactionDebitRows(data.debits.map(createTransactionRow))
    setTransactionCreditRows(data.credits.map(createTransactionRow))
    setReconciledRows(createReconciledRows(data.reconciledSummary))
  }

  const handleCreditRowUpdate = (updatedRow: UiTransaction, originalRow: UiTransaction) => {
    setEditedCredits([
      ...(editedCredits.filter(t => t.id !== originalRow.id)),
      createEdit(updatedRow)
    ])
    return updatedRow
  }

  const handleDebitRowUpdate = (updatedRow: UiTransaction, originalRow: UiTransaction) => {
    setEditedDebits([
      ...(editedDebits.filter(t => t.id !== originalRow.id)),
      createEdit(updatedRow)
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