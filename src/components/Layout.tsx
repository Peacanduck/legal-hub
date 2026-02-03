import React from 'react';
import { Link } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="container">
      <header className="nav-header">
        <Link to="/" className="nav-brand">⚖️ Dev Legal Hub</Link>
      </header>
      <main>
        {children}
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Independent Developer. All rights reserved.</p>
      </footer>
    </div>
  );
};