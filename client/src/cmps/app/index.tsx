import React, { useEffect, useState } from 'react'
import './app.css'
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


const App = () => {
  const [mainPanelCmp, setMainPanelCmp] = useState('UploadCSV')
  const [categories, setCategories] = useState<string[]>([])
  const [ingestedData, setIngestedData] = useState<APIIngestedData>({
    debits: [],
    credits: [],
    uncategorizableDebits: [],
  })


  useEffect(() => {
    console.count('app useeffect')
    Promise.all([
      fatch('inputs'),
      fatch('categories')
    ]).then((data: [APIIngestedData, string[]]) => {
      const [ingestedData, categories] = data;
      setIngestedData(ingestedData)
      setCategories(categories)
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
              case 'IngestedData':
                return <IngestedData
                  categories={categories}
                  debits={ingestedData.debits}
                  credits={ingestedData.credits}
                  uncategorizableDebits={ingestedData.uncategorizableDebits} >
                </IngestedData>
              case 'UploadCSV':
                return <UploadCSV></UploadCSV>
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

