import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import './styles.css'

export const Sidebar = ({ setMainPanelCmp }: any) => {
  const handleUploadCSVs = async () => {
    setMainPanelCmp('UploadCSV')
  }
  
  const handleShowIngestedData = async () => {
    setMainPanelCmp('IngestedData')
  }

  const handleGenerateCSVs = async () => {
    setMainPanelCmp('DisplayCSV')
  }

  return (
    <Stack spacing={2} className='sidebar' direction="column">
      <Button variant="contained" onClick={handleUploadCSVs}>Upload CSVs</Button>
      <Button variant="contained" onClick={handleShowIngestedData}>Edit Data</Button>
      <Button variant="contained" onClick={handleGenerateCSVs}>Output CSVs</Button>
    </Stack>
  )
}