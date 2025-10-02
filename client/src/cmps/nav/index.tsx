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

      <NavLink to="/inputs">
        <Button variant="outlined">Inputs</Button>
      </NavLink>

      <NavLink to="/outputs">
        <Button variant="outlined">Outputs</Button>
      </NavLink>
    </div>
  )
}