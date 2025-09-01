import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import './sidebar.css'

export const Sidebar = ({ setMainPanelCmp }: any) => {
  const handleShowIngestedData = async () => {
    setMainPanelCmp('IngestedData')
  }

  const handleUploadCSVs = async () => {
    setMainPanelCmp('UploadCSV')
  }

  return (
    <Stack spacing={2} className='sidebar' direction="column">
      <Button variant="contained" onClick={handleUploadCSVs}>Upload CSVs</Button>
      <Button variant="contained" onClick={handleShowIngestedData}>Show Data</Button>
    </Stack>
  )
}