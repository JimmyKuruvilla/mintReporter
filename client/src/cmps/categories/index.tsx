
import { useContext, useEffect, useState } from 'react'
import './styles.css'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { GlobalContext } from '../../contexts/global';
import Button from '@mui/material/Button';
import { IUiMatchers } from '@/server/services/summary'
import { fatch } from '../../utils/fatch';

type CategoriesProps = {
  setCategories: Function
}

export const Categories = ({ setCategories }: CategoriesProps) => {
  const { ctx, setCtx } = useContext(GlobalContext)
  const [localCategories, setLocalCategories] = useState([])
  const [matchers, setMatchers] = useState<IUiMatchers>({})

  useEffect(() => {
    fatch({ path: 'categories/matchers', }).then((data) => {
      console.log('setting categories')
      setCategories(data.categories)
      setLocalCategories(data.categories)
      setMatchers(data.matchers)
    })
  }, [])

  return (
    <div className='categories'>
      {Object.keys(matchers).map((category) => <div key={category}>
        <h3>{category}</h3>
        <ol>
          {matchers[category].map(query => <li>{query}</li>)}

        </ol>
      </div>)}
      {/* <Button variant="contained" onClick={handleCreateInputs}>Save</Button>
      <Button variant="contained" onClick={handleDeleteInputs}>Delete All</Button> */}
    </div>
  )
}