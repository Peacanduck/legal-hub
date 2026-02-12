import { useParams, Link, Navigate } from 'react-router-dom';
import { getAppById } from '../data/apps';

export const AppHome = () => {
  const { appId } = useParams();
  const app = getAppById(appId);

  if (!app) return <Navigate to="/" replace />;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ fontSize: '0.9rem' }}>&larr; Back to Apps</Link>
      </div>
      
      <h1>{app.name} Legal</h1>
      <p>Legal documentation and compliance information for <strong>{app.name}</strong>.</p>

      <div className="button-list">
        <Link to={`/${app.id}/privacy`} className="card" style={{ flex: '1 1 45%' }}>
          <h3>🔒 Privacy Policy</h3>
        </Link>
        <Link to={`/${app.id}/terms`} className="card" style={{ flex: '1 1 45%' }}>
          <h3>📜 Terms & Conditions</h3>
        </Link>
        <Link to={`/${app.id}/license`} className="card" style={{ flex: '1 1 45%' }}>
          <h3>⚖️ License (EULA)</h3>
        </Link>
        <Link to={`/${app.id}/copyright`} className="card" style={{ flex: '1 1 45%' }}>
          <h3>©️ Copyright</h3>
        </Link>
      </div>
    </div>
  );
};