import { useContext, useEffect, useState } from 'react'
import './styles.css'
import Button from '@mui/material/Button';
import { baseUrl, fatch } from '../../utils/fatch';

export type CSVData = { creditsCSV: string, debitsCSV: string, summaryCSV: string }

// move ingesteddata fetch into IngestedData

const getDownloadPath = (name: string) => `${baseUrl}/download/${name}`
export const DisplayCSV = () => {
  const [outputs, setOutputs] = useState<CSVData>({ creditsCSV: '', debitsCSV: '', summaryCSV: '' })

  const handleRun = () => {
    fatch({ path: 'outputs', method: 'post' }).then(data => {
      setOutputs(data)
    })
  }

  return (
    <div className='displayCSV'>
      <Button variant="contained" sx={{ marginBottom: '10px' }} onClick={handleRun}>Generate</Button>

      {outputs.summaryCSV && <a href={getDownloadPath('summary')} download>💾 Summary</a>}
      {outputs.creditsCSV && <a href={getDownloadPath('credit')} download>💾 Credits</a>}
      {outputs.debitsCSV && <a href={getDownloadPath('debit')} download>💾 Debits</a>}

      {
        outputs.summaryCSV &&
        <>
          <a href={getDownloadPath('summary')} download><h4>Summary</h4></a>
          <pre>
            {outputs.summaryCSV}
          </pre>
        </>
      }

      {
        outputs.creditsCSV &&
        <>
          <a href={getDownloadPath('credit')} download><h4>Credits</h4></a>
          <pre>
            {outputs.creditsCSV}
          </pre>
        </>
      }

      {
        outputs.debitsCSV &&
        <>
          <a href={getDownloadPath('debit')} download><h4>Debits</h4></a>
          <pre>
            {outputs.debitsCSV}
          </pre>
        </>
      }
    </div>
  )
}