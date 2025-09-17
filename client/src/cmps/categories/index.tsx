
import { useContext, useEffect, useState } from 'react'
import './styles.css'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { GlobalContext } from '../../contexts/global';
import Button from '@mui/material/Button';
import { IUiMatcher } from '@/server/services/summary'
import { fatch } from '../../utils/fatch';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

type CategoriesProps = {
  setUmbrellaCategories: Function
}
// should be on this the backend prop?
type CategoryUIMatcher = IUiMatcher & { id: number, shouldBeDeleted: boolean }
const createRow = (matcher: CategoryUIMatcher, index: number) => ({
  id: index,
  category: matcher.category,
  query: matcher.query,
  shouldBeDeleted: false
})

const DATA_GRID_DELETE = { _action: 'delete' }

export const Categories = ({ setUmbrellaCategories }: CategoriesProps) => {
  const { ctx, setCtx } = useContext(GlobalContext)
  const [localCategories, setLocalCategories] = useState([])
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rows, setRows] = useState<CategoryUIMatcher[]>([])
  const [rowDeleted, setRowDeleted] = useState<{}>({})

  useEffect(() => {
    fatch({ path: 'categories/matchers', }).then((data) => {
      console.log('setting categories')
      // setUmbrellaCategories(data.categories)
      setLocalCategories(data.categories)
      setRows(data.matchers.map(createRow))

      setColumns([
        {
          field: 'actions',
          headerName: '',
          width: 60,
          renderCell: (params) => {
            const handleButtonClick = () => {
              params.row.shouldBeDeleted = true;
              setRowDeleted({})
              // eventually fatch delete /categories/matchers/:id
            };

            return (
              <IconButton onClick={handleButtonClick}>
                <DeleteIcon />
              </IconButton>
            );
          },
        },
        { field: 'category', headerName: 'Category', width: 200 },
        { field: 'query', headerName: 'Matcher', width: 200 },
      ])
    })
  }, [])

  useEffect(() => {
    setRows(rows.filter(row => !row.shouldBeDeleted))
  }, [rowDeleted])

  const handleAddRow = () => setRows(
    [{
      id: Math.round(1e7 + Math.random() * 1000),
      category: 'New Category',
      query: 'New Matcher',
      shouldBeDeleted: false
    },
    ...rows]
  )

  const saveRow = (row: CategoryUIMatcher) => {
    console.log('saving row - do any validation here and return the originalrow if fails', row)
    return row
  }

  const handleSaveChanges = () => {
    console.log(rows.length)
    fatch({ path: 'categories/matchers', method: 'post', body: rows }).then((data) => {
      console.log(data)
    })
  }
  /**
  * make category fields editable
  * the user should be able to make changes temporarily, run reports and validate their categories, and then persist them if they want
  * 
  * categories should return the filename modified/final.json that is being used and display it
  * the backend should read from modified if available, otherwise use final
  * making changes creates modified
  * add a button to copy the modified over to the final. 
  * 
  * data cmp before categories
  * - show uncategorizable first
  * user then edits categories for perma queries, reruns until satisfied
  * 
  * then edits individual records until satisfied
  * remove perma query from ingested data
  * 
   */
  const paginationModel = { page: 0, pageSize: 100 };

  return (
    <div className='categories'>
      <Button variant="contained" onClick={handleAddRow}>Add</Button>
      <Button variant="contained" onClick={handleSaveChanges}>Save</Button>

      <DataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={(updatedRow, originalRow) => saveRow(updatedRow)}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[50, 100]}
        density="compact"
      />

      {/* <Button variant="contained" onClick={removeRow}>-</Button> */}

      {/* <Button variant="contained" onClick={handleDeleteInputs}>Delete All</Button> */}
    </div >
  )
}