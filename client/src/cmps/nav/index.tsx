import { Button } from '@mui/material'
import { NavLink } from 'react-router'
import './styles.css'

export const Nav = () => {

  return (
    <div className="nav">
      <NavLink to="/categories">
        <Button variant="outlined">Categories</Button>
      </NavLink>

      <NavLink to="/uploads">
        <Button variant="outlined">Uploads</Button>
      </NavLink>

      <NavLink to="/transactions/current">
        <Button variant="outlined">Transactions</Button>
      </NavLink>

      <NavLink to="/transactions/historical">
        <Button variant="outlined">History</Button>
      </NavLink>

      <NavLink to="/outputs">
        <Button variant="outlined">Outputs</Button>
      </NavLink>
    </div>
  )
}