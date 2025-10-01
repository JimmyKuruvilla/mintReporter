
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useState } from 'react';
import { fatch } from '../../../utils/fatch';
import './styles.css';

const START_DATE = 'startDate'
const END_DATE = 'endDate'

type DateSelectorProps = {
  updateCalculated: Function
}

export const DateSelector = ({ updateCalculated }: DateSelectorProps) => {
  const [hasChanges, setHasChanges] = useState(false)

  const initialStartDate = localStorage.getItem(START_DATE)
    ? dayjs(localStorage.getItem(START_DATE))
    : dayjs(new Date()).startOf('month')

  const initialEndDate = localStorage.getItem(END_DATE)
    ? dayjs(localStorage.getItem(END_DATE))
    : dayjs(new Date()).endOf('month')

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

  const handleCalculate = async () => {
    const formattedStartDate = startDate.format('YYYY-MM-DD')
    const formattedEndDate = endDate.format('YYYY-MM-DD')

    localStorage.setItem(START_DATE, formattedStartDate)
    localStorage.setItem(END_DATE, formattedEndDate)

    fatch({
      path: 'inputs', method: 'post',
      body: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    }).then((data) => {
      setHasChanges(false)
      updateCalculated(data)
    })
  }

  const handleDeleteInitialData = async () => {
    fatch({
      path: 'inputs', method: 'delete',
    }).then((data) => {
      setHasChanges(false)
      updateCalculated(data)
    })
  }

  return (
    <div className='inputs'>
      <div>
        <DatePicker defaultValue={startDate} onChange={handleSetStartDate}></DatePicker>
      </div>
      <div>
        <DatePicker defaultValue={endDate} onChange={handleSetEndDate}></DatePicker>
      </div>
      <Button variant="contained" color={hasChanges ? "secondary" : "primary"} onClick={handleCalculate}>Calculate</Button>
      <Button variant="contained" onClick={handleDeleteInitialData} color="error">Clear</Button>
    </div>
  )
}