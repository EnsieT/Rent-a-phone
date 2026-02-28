import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          📱 RentAPhone
        </Link>
        <ul className="navbar-links">
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/phones">Browse Phones</NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/rentals">My Rentals</NavLink>
            </li>
          )}
        </ul>
        <div className="navbar-actions">
          {user ? (
            <>
              <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                Hi, {user.name.split(' ')[0]}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
