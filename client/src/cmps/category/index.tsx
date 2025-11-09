

import ControlPointIcon from '@mui/icons-material/ControlPoint';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { UiMatcher } from '../../../../server/domains/category';
import { fatchWithAlert } from '../../utils/fatch';
import './styles.css';

type CategoryLoaderData = {
  matchers: UiMatcher[]
}

const createRow = (matcher: UiMatcher) => ({
  id: matcher.id,
  category: matcher.category,
  query: matcher.query,
  markedForDelete: matcher.markedForDelete
})

export const Category = () => {
  const { matchers }: CategoryLoaderData = useLoaderData();
  const [columns, setColumns] = useState<GridColDef[]>(() => {
    return [
      {
        field: 'actions',
        headerName: '',
        width: 60,
        renderCell: (params) => {
          const handleButtonClick = () => {
            params.row.markedForDelete = true;
            setRows(rows.filter(row => !row.markedForDelete))
            setHasChanges(true)
          };

          return (
            <IconButton onClick={handleButtonClick} color="primary">
              <DeleteIcon />
            </IconButton>
          );
        },
      },
      { field: 'id', headerName: 'Id' },
      { field: 'query', headerName: 'Matcher', width: 200, editable: true, },
      {
        field: 'category', headerName: 'Category', width: 200,
        editable: true,
      },
    ]
  });
  const [rows, setRows] = useState<UiMatcher[]>(() => matchers.map(createRow))
  const [hasChanges, setHasChanges] = useState(false)

  const handleAddRow = () => {
    setHasChanges(true)
    setRows(
      [{
        id: new Date().valueOf(),
        category: 'New Category',
        query: 'New Matcher',
        markedForDelete: false
      },
      ...rows]
    )
  }
  
  const handleRowUpdate = (updatedRow: UiMatcher, originalRow: UiMatcher) => {
    setRows([updatedRow, ...rows.filter(row => row.id !== updatedRow.id)])
    setHasChanges(true)
    return updatedRow
  }

  const handleSaveTempChanges = () => {
    fatchWithAlert({ path: 'categories/matchers/modified', method: 'post', body: rows }).then((data) => {
      setRows(data.matchers.map(createRow))
      setHasChanges(false)
    })
  }

  const handleAbandonTempChanges = () => {
    fatchWithAlert({ path: 'categories/matchers/modified', method: 'delete' }).then((data) => {
      setRows(data.matchers.map(createRow))
      setHasChanges(false)
    })
  }

  const handleSavePermanently = () => {
    fatchWithAlert({ path: 'categories/matchers/final', method: 'post', body: rows }).then((data) => {
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
        pageSizeOptions={[10, 100]}
        density="compact"
        showToolbar
      />
    </div>
  )
}