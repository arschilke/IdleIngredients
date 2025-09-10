import React from 'react';

interface NavigationProps {
  activeTab: 'dashboard' | 'resources' | 'trains' | 'destinations';
}

export const Navigation: React.FC<NavigationProps> = () => {
  return (
    <nav>
      <ul className="nav">
        <li className="nav-item">
          <a className="nav-link active" aria-current="page" href="#">
            Dashboard
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#">
            Resources
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#">
            Trains
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="#">
            Destinations
          </a>
        </li>
      </ul>
    </nav>
  );
};
