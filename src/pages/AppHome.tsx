import { useParams, Link, Navigate } from 'react-router-dom';
import { getAppById } from '../data/apps';

export const AppHome = () => {
  const { appId } = useParams();
  const app = getAppById(appId);

  if (!app) return <Navigate to="/" replace />;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ fontSize: '0.9rem' }}>&larr; Back to Projects</Link>
      </div>
      
      {/* Project Header */}
      <div style={{ textAlign: 'center', margin: '3rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{app.name}</h1>
        {app.tagline && <p style={{ fontSize: '1.2rem', color: '#666' }}>{app.tagline}</p>}
        {app.link && (
          <a href={app.link} target="_blank" rel="noreferrer" className="btn" style={{ marginTop: '1.5rem' }}>
            Visit Project
          </a>
        )}
      </div>

      {/* Project Header */}
      <div style={{ textAlign: 'center', margin: '2rem 0 3rem 0' }}>
        
        {/* Banner Image */}
        {app.banner && (
          <img 
            src={app.banner} 
            alt={`${app.name} Banner`} 
            style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
          />
        )}

        {/* Square Logo (Shows if present) */}
        {app.logo && (
          <img 
            src={app.logo} 
            alt={`${app.name} Logo`} 
            style={{ width: '120px', height: '120px', borderRadius: '24px', marginBottom: '1rem', objectFit: 'cover', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
          />
        )}

        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{app.name}</h1>
        {app.tagline && <p style={{ fontSize: '1.2rem', color: '#666' }}>{app.tagline}</p>}
        
        {/* Call to Action & Social Links */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {app.link && (
            <a href={app.link} target="_blank" rel="noreferrer" className="btn">
              Visit Project
            </a>
          )}
          {app.socials?.discord && (
            <a href={app.socials.discord} target="_blank" rel="noreferrer" className="btn btn-outline">
              👾 Discord
            </a>
          )}
          {app.socials?.x && (
            <a href={app.socials.x} target="_blank" rel="noreferrer" className="btn btn-outline">
              𝕏 Twitter
            </a>
          )}
        </div>
      </div>

      {/* Project Details */}
      {(app.description || (app.features && app.features.length > 0)) && (
        <div className="card" style={{ marginBottom: '3rem', textAlign: 'left', padding: '2rem' }}>
          {app.description && <p style={{ fontSize: '1.1rem' }}>{app.description}</p>}
          
          {app.features && app.features.length > 0 && (
            <>
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Key Features</h3>
              <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#4b5563' }}>
                {app.features.map((feature, idx) => (
                  <li key={idx} style={{ marginBottom: '0.5rem' }}>{feature}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Legal Docs Section */}
      <h2 style={{ borderBottom: 'none', marginBottom: '1rem', textAlign: 'center' }}>Legal & Compliance</h2>
      <div className="button-list">
        <Link to={`/${app.id}/privacy`} className="card" style={{ flex: '1 1 45%' }}>
          <h3 style={{ margin: 0 }}>🔒 Privacy Policy</h3>
        </Link>
        <Link to={`/${app.id}/terms`} className="card" style={{ flex: '1 1 45%' }}>
          <h3 style={{ margin: 0 }}>📜 Terms & Conditions</h3>
        </Link>
        <Link to={`/${app.id}/license`} className="card" style={{ flex: '1 1 45%' }}>
          <h3 style={{ margin: 0 }}>⚖️ License (EULA)</h3>
        </Link>
        <Link to={`/${app.id}/copyright`} className="card" style={{ flex: '1 1 45%' }}>
          <h3 style={{ margin: 0 }}>©️ Copyright</h3>
        </Link>
      </div>
    </div>
  );
};