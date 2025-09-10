import { Link } from 'react-router';

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-3">
      <div className="container-fluid">
        <Link className="navbar-brand text-primary" to="/">
          Idle Ingredients
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/resources">
                Resources
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/trains">
                Trains
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
