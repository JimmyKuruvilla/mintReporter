import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import { IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import { useState } from 'react';
import { baseUrl, fatchWithAlert} from '../../utils/fatch';
import './styles.css';

export type CSVData = { creditsCSV: string, debitsCSV: string, summaryCSV: string }

const getDownloadPath = (name: string) => `${baseUrl}/outputs/${name}`

export const DisplayCSV = () => {
  const [outputs, setOutputs] = useState<CSVData>({ creditsCSV: '', debitsCSV: '', summaryCSV: '' })

  const handleRun = () => {
    fatchWithAlert({ path: 'outputs', method: 'post' }).then(data => {
      setOutputs(data)
    })
  }

  const handleCopyToClipBoard = (type: string) => () => {
    switch (type) {
      case 'credit':
        navigator.clipboard.writeText(outputs.creditsCSV);
        break
      case 'debit':
        navigator.clipboard.writeText(outputs.debitsCSV);
        break
      case 'summary':
        navigator.clipboard.writeText(outputs.summaryCSV);
        break
      default:
        break
    }
  }

  return (
    <div className='displayCSV'>
      <Button variant="contained" sx={{ marginBottom: '10px' }} onClick={handleRun}>Generate Using Permanent Categories</Button>

      <div>
        {outputs.summaryCSV && <>
          <h4>Summary</h4>
          <IconButton href={getDownloadPath('summary')} download color="primary">
            <SaveIcon></SaveIcon>
          </IconButton>
          <IconButton onClick={handleCopyToClipBoard('summary')} color="primary">
            <ContentCopyIcon />
          </IconButton>
          <pre>
            {outputs.summaryCSV}
          </pre>
        </>}
      </div>

      <div>
        {outputs.creditsCSV && <>
          <h4>Credits</h4>
          <IconButton href={getDownloadPath('credit')} download color="primary">
            <SaveIcon></SaveIcon>
          </IconButton>
          <IconButton onClick={handleCopyToClipBoard('credit')} color="primary">
            <ContentCopyIcon />
          </IconButton>
          <pre>
            {outputs.creditsCSV}
          </pre>
        </>}
      </div>

      <div>
        {outputs.debitsCSV && <>
          <h4>Debits</h4>
          <IconButton href={getDownloadPath('debit')} download color="primary">
            <SaveIcon></SaveIcon>
          </IconButton>
          <IconButton onClick={handleCopyToClipBoard('debit')} color="primary">
            <ContentCopyIcon />
          </IconButton>
          <pre>
            {outputs.debitsCSV}
          </pre>
        </>}
      </div>

    </div>
  )
}