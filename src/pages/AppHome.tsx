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
      <p>Select a document below to view the details for <strong>{app.name}</strong>.</p>

      <div className="button-list">
        <Link to={`/${app.id}/privacy`} className="card" style={{ flex: 1, minWidth: '200px' }}>
          <h3>🔒 Privacy Policy</h3>
          <p style={{ color: '#666' }}>How we handle your data.</p>
        </Link>
        <Link to={`/${app.id}/terms`} className="card" style={{ flex: 1, minWidth: '200px' }}>
          <h3>📜 Terms & Conditions</h3>
          <p style={{ color: '#666' }}>Rules for using the app.</p>
        </Link>
      </div>
    </div>
  );
};