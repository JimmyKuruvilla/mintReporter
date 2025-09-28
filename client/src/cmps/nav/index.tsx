import { Button } from '@mui/material'
import { NavLink } from 'react-router'
import './styles.css'

export const Nav = () => {

  return (
    <div className="nav">
      <NavLink to="/categories">
        <Button variant="contained">Categories</Button>
      </NavLink>

      <NavLink to="/uploads">
        <Button variant="contained">Uploads</Button>
      </NavLink>

      <NavLink to="/inputs">
        <Button variant="contained">Inputs</Button>
      </NavLink>

      <NavLink to="/outputs">
        <Button variant="contained">Outputs</Button>
      </NavLink>
    </div>
  )
}