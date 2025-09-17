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


const App = () => {
  const [mainPanelCmp, setMainPanelCmp] = useState('UploadCSV')
  const [umbrellaCategories, setUmbrellaCategories] = useState<string[]>([])
  const [ingestedData, setIngestedData] = useState<APIIngestedData>({
    debits: [],
    credits: []
  })


  useEffect(() => {
    console.count('app useeffect')
    Promise.all([
      fatch({ path: 'categories' })
    ]).then((data: [string[]]) => {
      const [umbrellaCategories] = data;
      setUmbrellaCategories(umbrellaCategories)
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
              case 'UploadCSV':
                return <UploadCSV></UploadCSV>
              case 'Inputs':
                return <Inputs setIngestedData={setIngestedData}></Inputs>
              case 'Categories':
                return <Categories setUmbrellaCategories={setUmbrellaCategories}></Categories>
              case 'IngestedData':
                return <IngestedData
                  categories={umbrellaCategories}
                  debits={ingestedData.debits}
                  credits={ingestedData.credits}>
                </IngestedData>
              case 'DisplayCSV':
                return <DisplayCSV></DisplayCSV>
              default:
                return <UploadCSV></UploadCSV>
            }
          })()}
        </Container>
      </LocalizationProvider>
    </div >
  )
}

createRoot(document.getElementById('root')!).render(<App />)

