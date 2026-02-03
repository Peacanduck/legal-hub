import { useParams, Navigate, Link } from 'react-router-dom';
import { getAppById } from '../data/apps';
import { getPolicyComponent } from '../policies/registry';

type DocType = 'privacy' | 'terms';

export const LegalDoc = ({ type }: { type: DocType }) => {
  const { appId } = useParams();
  const app = getAppById(appId);

  // 1. Validation: Does the app exist?
  if (!app) return <Navigate to="/" replace />;

  const title = type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions';
  
  // 2. Dynamic Content Retrieval: Get the correct component for this specific app
  const PolicyContent = getPolicyComponent(app.id, type);
  
  return (
    <article>
      <div style={{ marginBottom: '1rem' }}>
        <Link to={`/${app.id}`} style={{ fontSize: '0.9rem' }}>&larr; Back to {app.name}</Link>
      </div>

      <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
        <h1>{title}</h1>
        <p className="meta-info" style={{ marginTop: '0.5rem' }}>
          <strong>App:</strong> {app.name} &bull; 
          <strong> Last Updated:</strong> {app.lastUpdated}
        </p>
      </header>

      {/* 3. Render the selected content component */}
      <div className="policy-content">
        <PolicyContent appName={app.name} email={app.contactEmail} />
      </div>
      
    </article>
  );
};
