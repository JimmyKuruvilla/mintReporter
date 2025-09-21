import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import './styles.css'

export const Sidebar = ({ setMainPanelCmp }: any) => {

  const showUploadCSVs = async () => {
    setMainPanelCmp('UploadCSV')
  }

  const showShowIngestedData = async () => {
    setMainPanelCmp('IngestedData')
  }

  const showGenerateCSVs = async () => {
    setMainPanelCmp('DisplayCSV')
  }

  const showCategories = async () => {
    setMainPanelCmp('Categories')
  }

  return (
    <Stack spacing={2} className='sidebar' direction="column">
      <Button variant="contained" onClick={showCategories}>Categories</Button>
      <Button variant="contained" onClick={showUploadCSVs}>Uploads</Button>
      <Button variant="contained" onClick={showShowIngestedData}>Inputs</Button>
      <Button variant="contained" onClick={showGenerateCSVs}>Outputs</Button>
    </Stack>
  )
}