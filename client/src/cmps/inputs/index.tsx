
import { useContext, useState } from 'react'
import './styles.css'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { GlobalContext } from '../../contexts/global';
import Button from '@mui/material/Button';
import { fatch } from '../../utils/fatch';

type InputProps = {
  setIngestedData: Function
}

export const Inputs = ({ setIngestedData }: InputProps) => {
  const { ctx, setCtx } = useContext(GlobalContext)
  const [startDate, setStartDate] = useState(ctx.uploadStartDate)
  const [endDate, setEndDate] = useState(ctx.uploadEndDate)

  const handleSetStartDate = (pickedDate: any) => {
    setStartDate(pickedDate)
    setCtx({ ...ctx, uploadStartDate: pickedDate })
  }

  const handleSetEndDate = (pickedDate: any) => {
    setEndDate(pickedDate)
    setCtx({ ...ctx, uploadEndDate: pickedDate })
  }

  const handleCreateInputs = async () => {
    fatch({
      path: 'inputs', method: 'post',
      body: {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      }
    }).then((data) => {
      setIngestedData(data)
    })
  }

  const handleDeleteInputs = async () => {
    fatch({ path: 'inputs', method: 'delete', }).then((data) => {
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
      <Button variant="contained" onClick={handleCreateInputs}>Save</Button>
      <Button variant="contained" onClick={handleDeleteInputs}>Delete All</Button>
    </div>
  )
}