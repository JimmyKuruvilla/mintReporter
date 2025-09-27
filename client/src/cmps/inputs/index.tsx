
import { useContext, useState } from 'react'
import './styles.css'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { GlobalContext } from '../../contexts/global';
import Button from '@mui/material/Button';
import { fatch } from '../../utils/fatch';
import dayjs from 'dayjs';

type InputProps = {
  setIngestedData: Function
}
const START_DATE = 'startDate'
const END_DATE = 'endDate'

export const Inputs = ({ setIngestedData }: InputProps) => {
  const { ctx, setCtx } = useContext(GlobalContext)

  const initialStartDate = localStorage.getItem(START_DATE)
    ? dayjs(localStorage.getItem(START_DATE))
    : dayjs(new Date()).startOf('month')

  const initialEndDate = localStorage.getItem(END_DATE)
    ? dayjs(localStorage.getItem(END_DATE))
    : dayjs(new Date()).endOf('month')

  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)

  const handleSetStartDate = (pickedDate: any) => {
    setStartDate(pickedDate)
  }

  const handleSetEndDate = (pickedDate: any) => {
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
      setIngestedData(data)
    })
  }

  const handleDeleteInitialData = async () => {
    fatch({
      path: 'inputs', method: 'delete',
    }).then((data) => {
      setIngestedData(data)
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
      <Button variant="contained" onClick={handleCalculate}>Calculate</Button>
      <Button variant="contained" onClick={handleDeleteInitialData} color="error">Clear</Button>
    </div>
  )
}