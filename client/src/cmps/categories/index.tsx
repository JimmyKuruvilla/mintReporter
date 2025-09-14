
import { useContext, useState } from 'react'
import './styles.css'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { GlobalContext } from '../../contexts/global';
import Button from '@mui/material/Button';
import { fatch } from '../../utils/fatch';

type CategoriesProps = {
  setCategories: Function
}

export const Categories = ({ setCategories }: CategoriesProps) => {
  const { ctx, setCtx } = useContext(GlobalContext)
  const [startDate, setStartDate] = useState(ctx.uploadStartDate)
  const [endDate, setEndDate] = useState(ctx.uploadEndDate)

  // use eeffect to set categories intially globally
  // display categories as data grid and allow edits. 
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
      setCategories(data)
    })
  }

  return (
    <div className='inputs'>

      {/* <Button variant="contained" onClick={handleCreateInputs}>Save</Button>
      <Button variant="contained" onClick={handleDeleteInputs}>Delete All</Button> */}
    </div>
  )
}