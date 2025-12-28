
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import { DATE_FORMAT } from '../../../../../server/constants';
import { getStartAndEndDatesWithMonthFallback, saveEndDate, saveStartDate } from '../../../utils/dateService';
import { fatchWithAlert } from '../../../utils/fatch';
import './styles.css';

type TransactionToolbarProps = {
  updateDisplayData: Function
}

export const TransactionToolbar = ({ updateDisplayData }: TransactionToolbarProps) => {
  const [hasChanges, setHasChanges] = useState(false)

  const { startDate: initialStartDate, endDate: initialEndDate } = getStartAndEndDatesWithMonthFallback()
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)

  const handleSetStartDate = (pickedDate: any) => {
    setHasChanges(true)
    setStartDate(pickedDate)
  }

  const handleSetEndDate = (pickedDate: any) => {
    setHasChanges(true)
    setEndDate(pickedDate)
  }

  const handleIngestFromUploads = async () => {
    const formattedStartDate = startDate.format(DATE_FORMAT)
    const formattedEndDate = endDate.format(DATE_FORMAT)

    saveStartDate(formattedStartDate)
    saveEndDate(formattedEndDate)

    fatchWithAlert({
      path: 'transactions', method: 'post',
      body: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    }).then((data) => {
      setHasChanges(false)
      updateDisplayData(data)
    })
  }

  const handleDeleteCurrentWorkingData = async () => {
    const formattedStartDate = startDate.format(DATE_FORMAT)
    const formattedEndDate = endDate.format(DATE_FORMAT)
    const query = new URLSearchParams({
      startDate: formattedStartDate,
      endDate: formattedEndDate
    }).toString();

    fatchWithAlert({
      path: `transactions?${query}`, method: 'delete',
    }).then((data) => {
      setHasChanges(false)
      updateDisplayData(data)
    })
  }

  const handleCopyToHistory = async () => {
    const formattedStartDate = startDate.format(DATE_FORMAT)
    const formattedEndDate = endDate.add(1, 'day').format(DATE_FORMAT)

    fatchWithAlert({
      path: 'transactions/history', method: 'post',
      body: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    })
  }
  
  return (
    <div className='dateInputs'>
      <div className='buttons'>
        <DatePicker className='datepicker' defaultValue={startDate} onChange={handleSetStartDate}></DatePicker>
        <DatePicker className='datepicker endDate' defaultValue={endDate} onChange={handleSetEndDate}></DatePicker>

        <div className='right'>
          <Button variant="contained" color={hasChanges ? 'secondary' : 'primary'} onClick={handleIngestFromUploads}>Ingest Uploads</Button>
          <Button variant="contained" onClick={handleDeleteCurrentWorkingData} color='error'>Clear</Button>
          <Button variant="contained" onClick={handleCopyToHistory} color='primary'>Copy to History</Button>
        </div>
      </div>
    </div>
  )
}