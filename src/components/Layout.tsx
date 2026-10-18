import React from 'react';
import { Link } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="container">
      <header className="nav-header">
        <Link to="/" className="nav-brand">
          <img src="/pydigital-mark.svg" alt="" width={24} height={24} />
          Py Digital
        </Link>
      </header>
      <main>
        {children}
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Py Digital. All rights reserved.</p>
      </footer>
    </div>
  );
};