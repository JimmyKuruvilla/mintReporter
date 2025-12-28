
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import { getStartAndEndDatesWithMonthFallback } from '../../../../utils/dateService';
import { fatchWithAlert } from '../../../../utils/fatch';
import './styles.css';

type TransactionToolbarProps = {
  updateDisplayData: Function
}

export const HistoricalTransactionToolbar = ({ updateDisplayData }: TransactionToolbarProps) => {
  const { startDate: initialStartDate, endDate: initialEndDate } = getStartAndEndDatesWithMonthFallback()

  // TODO start here: 
  // 1. just made the change to get start end end dates. 
  // 2. does date on both tool bars still work right?
  // 3. should be able to fetch a date range of historical data
  // 4. should be able to save a dat range by putton press. 

  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)

  const handleSetStartDate = (pickedDate: any) => {
    setStartDate(pickedDate)
  }

  const handleSetEndDate = (pickedDate: any) => {
    setEndDate(pickedDate)
  }

  const handleGetRecordsForPeriod = async () => {
    const formattedStartDate = startDate.format('YYYY-MM-DD')
    const formattedEndDate = endDate.format('YYYY-MM-DD')
    
    const query = new URLSearchParams({
      startDate: formattedStartDate,
      endDate: formattedEndDate
    }).toString()

    fatchWithAlert({ path: `transactions/history?${query}` })
      .then((data) => {
        updateDisplayData(data)
      })
  }


  return (
    <div className='dateInputs'>
      <div className='buttons'>
        <DatePicker className='datepicker' defaultValue={startDate} onChange={handleSetStartDate}></DatePicker>
        <DatePicker className='datepicker endDate' defaultValue={endDate} onChange={handleSetEndDate}></DatePicker>

        <div className='right'>
          <Button variant="contained" onClick={handleGetRecordsForPeriod}>Get Records</Button>
        </div>
      </div>
    </div>
  )
}