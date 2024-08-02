import React from 'react';
import { Link, NavLink } from 'react-router-dom';

function Header() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/"><h1 class="display-2">Welcome to your Book Case</h1></Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink 
                className="nav-link" 
                to="/"
                style={({ isActive }) => ({
                    color: isActive ? '#fff' : '#545e6f',
                    background: isActive ? '#7600dc' : '#f0f0f0',
                  })}>
                    Bookshelves
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className="nav-link" 
                to="/bookshelves/create"
                style={({ isActive }) => ({
                    color: isActive ? '#fff' : '#545e6f',
                    background: isActive ? '#7600dc' : '#f0f0f0',
                  })}>
                    Create Bookshelf
              </NavLink>
              {/* <NavLink className="nav-link" to="/bookshelves/create">Create Bookshelf</NavLink> */}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Header;
