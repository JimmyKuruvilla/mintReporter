import { Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router';
import { fatch } from '../../utils/fatch';
import { Categories } from '../categories';
import { DisplayCSV } from '../displayCSV';
import { IngestedData } from '../ingestedData';
import { Nav } from '../nav';
import { UploadCSV } from '../uploadCSV';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './styles.css';

const App = () => {
  return (
    <div className='app'>
      <Nav></Nav>
      <Container className='mainPanel' maxWidth={false}>
        <Outlet></Outlet>
      </Container>
    </div >
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        path: "/categories",
        loader: async () => {
          const matchersData = await fatch({ path: 'categories/matchers' })

          return { umbrellaCategories: matchersData.categories, matchers: matchersData.matchers }
        },
        Component: Categories
      },
      {
        path: "/uploads",
        loader: async () => {
          const res = await fatch({ path: 'uploads' })
          return { filesOnServer: res }
        },
        Component: UploadCSV
      },
      {
        path: "/inputs",
        loader: async () => {
          const categories = await fatch({ path: 'categories' })
          const { credits, debits, reconciledSummary } = await fatch({ path: 'inputs' })
          return { categories, credits, debits, reconciledSummary }
        },
        Component: IngestedData,
      },
      {
        path: "/outputs",
        Component: DisplayCSV
      },
    ]
  },

]);

createRoot(document.getElementById('root')!).render(
  <>
    <CssBaseline />
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <RouterProvider router={router} />
    </LocalizationProvider >
  </>
)
