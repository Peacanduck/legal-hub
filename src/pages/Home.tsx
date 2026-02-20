import { AppCard } from '../components/AppCard';
import { apps } from '../data/apps';

export const Home = () => {
  return (
    <div>
      <h1>Welcome to PyroLabs</h1>
      <p className="meta-info">The project directory for Pyrolabs.</p>
      
      <h2>Our Projects</h2>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginTop: '1.5rem' }}>
        {apps.map((app) => (
          <AppCard key={app.id} id={app.id} name={app.name} />
        ))}
      </div>
    </div>
  );
};

/*import { Link } from 'react-router-dom';
import { apps } from '../data/apps';

export const Home = () => {
  return (
    <div>
      <h1>Legal Hub</h1>
      <p className="meta-info">Central repository for Privacy Policies and Terms of Service for my applications.</p>
      
      <h2>My Applications</h2>
      <div style={{ marginTop: '1.5rem' }}>
        {apps.map((app) => (
          <Link to={`/${app.id}`} key={app.id} style={{ textDecoration: 'none' }}>
            <div className="card">
              <h3>{app.name}</h3>
              <p style={{ color: '#666' }}>View legal documents &rarr;</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};*/