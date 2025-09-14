import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import './styles.css'
import { useContext } from 'react';
import { GlobalContext } from '../../contexts/global';

export const Sidebar = ({ setMainPanelCmp }: any) => {
  const { ctx, setCtx } = useContext(GlobalContext)

  const showUploadCSVs = async () => {
    setMainPanelCmp('UploadCSV')
  }

  const showShowIngestedData = async () => {
    setMainPanelCmp('IngestedData')
  }

  const showInputs = async () => {
    setMainPanelCmp('Inputs')
  }

  const showGenerateCSVs = async () => {
    setMainPanelCmp('DisplayCSV')
  }

  const showCategories = async () => {
    setMainPanelCmp('Categories')
  }

  return (
    <Stack spacing={2} className='sidebar' direction="column">
      <Button variant="contained" onClick={showUploadCSVs}>Uploads</Button>
      <Button variant="contained" onClick={showInputs}>Inputs</Button>
      <Button variant="contained" onClick={showCategories}>Categories</Button>
      <Button variant="contained" onClick={showShowIngestedData}>Data</Button>
      <Button variant="contained" onClick={showGenerateCSVs}>Outputs</Button>
    </Stack>
  )
}