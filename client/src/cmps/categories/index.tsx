
import { useContext, useEffect, useState } from 'react'
import './styles.css'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { GlobalContext } from '../../contexts/global';
import Button from '@mui/material/Button';
import { IUiMatcher } from '@/server/services/summary'
import { fatch } from '../../utils/fatch';
import { DataGrid, GridColDef, useGridApiRef } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ControlPointIcon from '@mui/icons-material/ControlPoint';

type CategoriesProps = {
  umbrellaCategories: string[],
  setUmbrellaCategories: Function
}
// should be on this the backend prop?
type CategoryUIMatcher = IUiMatcher & { id: number, markedForDelete: boolean }
const createRow = (matcher: CategoryUIMatcher, index: number) => ({
  id: index,
  category: matcher.category,
  query: matcher.query,
  markedForDelete: false
})

const DATA_GRID_DELETE = { _action: 'delete' }

export const Categories = ({ umbrellaCategories, setUmbrellaCategories }: CategoriesProps) => {
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [rows, setRows] = useState<CategoryUIMatcher[]>([])
  const [rowDeleted, setRowDeleted] = useState<{}>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fatch({ path: 'categories/matchers', }).then((data) => {
      console.log('setting categories')
      setRows(data.matchers.map(createRow))

      setColumns([
        {
          field: 'actions',
          headerName: '',
          width: 60,
          renderCell: (params) => {
            const handleButtonClick = () => {
              params.row.markedForDelete = true;
              setRowDeleted({})
              setHasChanges(true)
            };

            return (
              <IconButton onClick={handleButtonClick} color="primary">
                <DeleteIcon />
              </IconButton>
            );
          },
        },
        {
          field: 'category', headerName: 'Category', width: 200,
          type: 'singleSelect',
          valueOptions: umbrellaCategories,
          editable: true,
        },
        { field: 'query', headerName: 'Matcher', width: 200, editable: true, },
      ])
    })
  }, [])

  useEffect(() => {
    setRows(rows.filter(row => !row.markedForDelete))
  }, [rowDeleted])

  const handleAddRow = () => {
    setHasChanges(true)
    setRows(
      [{
        id: Math.round(1e7 + Math.random() * 1000),
        category: 'New Category',
        query: 'New Matcher',
        markedForDelete: false
      },
      ...rows]
    )
  }

  const handleRowUpdate = (updatedRow: CategoryUIMatcher, originalRow: CategoryUIMatcher) => {
    setRows([updatedRow, ...rows.filter(row => row.id !== updatedRow.id)])
    setHasChanges(true)
    return updatedRow
  }

  const handleSaveTempChanges = () => {
    fatch({ path: 'categories/matchers/modified', method: 'post', body: rows }).then((data) => {
      setUmbrellaCategories(data.categories)
      setRows(data.matchers.map(createRow))
      setHasChanges(false)
    })
  }

  const handleAbandonTempChanges = () => {
    fatch({ path: 'categories/matchers/modified', method: 'delete' }).then((data) => {
      setUmbrellaCategories(data.categories)
      setRows(data.matchers.map(createRow))
      setHasChanges(false)
    })
  }

  const handleSavePermanently = () => {
    fatch({ path: 'categories/matchers/final', method: 'post', body: rows }).then((data) => {
      setUmbrellaCategories(data.categories)
      setRows(data.matchers.map(createRow))
      setHasChanges(false)
    })
  }

  const paginationModel = { page: 0, pageSize: 10 };

  return (
    <div className='categories'>
      <span className='buttons'>
        <span className='left'>
          <IconButton onClick={handleAddRow} color="primary" >
            <ControlPointIcon />
          </IconButton>
        </span>
        <span className='right'>
          <Button variant="contained" onClick={handleAbandonTempChanges}>Abandon Changes</Button>
          <Button variant="contained" color={hasChanges ? "secondary" : "primary"} onClick={handleSaveTempChanges}>Save Changes</Button>
          <Button variant="contained" onClick={handleSavePermanently} color="error">Save Changes Permanently</Button>
        </span>
      </span>

      <DataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={handleRowUpdate}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[10, 1000]}
        density="compact"
        showToolbar
      />
    </div >
  )
}