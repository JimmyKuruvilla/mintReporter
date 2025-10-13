import { Container } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router';
import { fatchWithAlert } from '../../utils/fatch';
import { Category } from '../category';
import { DisplayCSV } from '../displayCSV';
import { Nav } from '../nav';
import { Transaction } from '../transaction';
import { UploadCSV } from '../uploadCSV';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './styles.css';

const theme = createTheme({ cssVariables: true });

const App = () => {
  return (
    <div className='app'>
      <Nav></Nav>
      <Container className='mainPanel'>
        <Outlet></Outlet>
      </Container>
    </div >
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        path: '/categories',
        loader: async () => {
          const matchersData = await fatchWithAlert({ path: 'categories/matchers' })
          return { matchers: matchersData.matchers }
        },
        Component: Category
      },
      {
        path: '/uploads',
        loader: async () => {
          const files = await fatchWithAlert({ path: 'uploads' })
          return { filesOnServer: files }
        },
        Component: UploadCSV
      },
      {
        path: '/transactions',
        loader: async () => {
          const categories = await fatchWithAlert({ path: 'categories' })
          const { credits, debits, reconciliation } = await fatchWithAlert({ path: 'transactions' })
          return { categories, credits, debits, reconciliation }
        },
        Component: Transaction,
      },
      {
        path: '/outputs',
        Component: DisplayCSV
      },
    ]
  },

]);

createRoot(document.getElementById('root')!).render(
  <>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RouterProvider router={router} />
      </LocalizationProvider >
    </ThemeProvider>
  </>
)
