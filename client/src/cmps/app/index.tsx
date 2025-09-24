import React, { useEffect, useState } from 'react'
import './styles.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { createRoot } from 'react-dom/client'
import { Sidebar } from '../sidebar'
import { GlobalContext, APIIngestedData, initialCtx } from '../../contexts/global'
import { IngestedData } from '../ingestedData';
import { UploadCSV } from '../uploadCSV';
import { Box, Paper, Container } from '@mui/material';
import { fatch } from '../../utils/fatch';
import { DisplayCSV } from '../displayCSV';
import { Inputs } from '../inputs';
import { Categories } from '../categories';
import { ICombinedSummary } from '../../../../server/services/summary';
import { FileOnServer } from '../../../../server/constants';

const App = () => {
  const [mainPanelCmp, setMainPanelCmp] = useState('UploadCSV')
  const [umbrellaCategories, setUmbrellaCategories] = useState<string[]>([])
  const [ingestedData, setIngestedData] = useState<APIIngestedData>({
    debits: [],
    credits: [],
    reconciledSummary: {} as ICombinedSummary
  })
  const [filesOnServer, setFilesOnServer] = useState<FileOnServer[]>([])

  useEffect(() => {
    console.count('App useEffect')
    Promise.all([
      fatch({ path: 'categories' }),
      fatch({ path: 'inputs' }),
      fatch({ path: 'uploads' })
    ]).then((data: [string[], APIIngestedData, FileOnServer[]]) => {
      const [umbrellaCategories, apiIngestedData, filesOnServer] = data;
      setIngestedData(apiIngestedData)
      setUmbrellaCategories(umbrellaCategories)
      setFilesOnServer(filesOnServer)
    })
  }, [])

  console.count('render App')

  return (
    <div className='app'>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Sidebar setMainPanelCmp={setMainPanelCmp}></Sidebar>
        <Container className='mainPanel' maxWidth={false}>
          {(() => {
            switch (mainPanelCmp) {
              case 'Categories':
                return <Categories
                  umbrellaCategories={umbrellaCategories}
                  setUmbrellaCategories={setUmbrellaCategories}>
                </Categories>
              case 'UploadCSV':
                return <UploadCSV filesOnServer={filesOnServer} setFilesOnServer={setFilesOnServer}></UploadCSV>
              case 'IngestedData':
                return <IngestedData
                  setIngestedData={setIngestedData}
                  categories={umbrellaCategories}
                  debits={ingestedData.debits}
                  credits={ingestedData.credits}
                  reconciledSummary={ingestedData.reconciledSummary}>
                </IngestedData>

              case 'DisplayCSV':
                return <DisplayCSV></DisplayCSV>
              default:
                return <UploadCSV filesOnServer={filesOnServer} setFilesOnServer={setFilesOnServer}></UploadCSV>
            }
          })()}
        </Container>
      </LocalizationProvider>
    </div >
  )
}

createRoot(document.getElementById('root')!).render(<App />)

