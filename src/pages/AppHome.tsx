import { useParams, Link, Navigate } from 'react-router-dom';
import { getAppById } from '../data/apps';

export const AppHome = () => {
  const { appId } = useParams();
  const app = getAppById(appId);

  if (!app) return <Navigate to="/" replace />;

  const isGame = app.type === 'game';

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ fontSize: '0.9rem' }}>&larr; Back to Projects</Link>
      </div>

      {isGame ? (
        /* --- GAMING LAYOUT --- */
        <div style={{ marginBottom: '3rem' }}>
          {/* Hero Section */}
          <div className="game-hero">
            {app.banner ? (
              <img src={app.banner} alt={`${app.name} Banner`} className="game-hero-bg" />
            ) : (
              <div className="game-hero-bg" />
            )}
            
            <div className="game-hero-overlay">
              <div className="game-header-row">
                {app.logo && <img src={app.logo} alt={`${app.name} Logo`} className="game-logo" />}
                <div>
                  <h1 className="game-title">{app.name}</h1>
                  {app.tagline && <p className="game-tagline">{app.tagline}</p>}
                </div>
              </div>

              <div className="game-actions">
                {app.link && (
                  <a href={app.link} target="_blank" rel="noreferrer" className="btn-game">
                    Play Now
                  </a>
                )}
                {app.socials?.discord && (
                  <a href={app.socials.discord} target="_blank" rel="noreferrer" className="btn-social">
                    👾 Discord
                  </a>
                )}
                {app.socials?.x && (
                  <a href={app.socials.x} target="_blank" rel="noreferrer" className="btn-social">
                    𝕏 Twitter
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Game Details Section */}
          {(app.description || (app.features && app.features.length > 0)) && (
            <div className="game-details">
              {app.description && <p style={{ fontSize: '1.15rem', lineHeight: '1.7' }}>{app.description}</p>}
              
              {app.features && app.features.length > 0 && (
                <>
                  <h3>Key Features</h3>
                  <div className="game-feature-grid">
                    {app.features.map((feature, idx) => (
                      <div key={idx} className="game-feature-card">
                        ✨ {feature}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        /* --- STANDARD APP LAYOUT --- */
        <>
          <div style={{ textAlign: 'center', margin: '3rem 0' }}>
            {app.logo && (
              <img 
                src={app.logo} 
                alt={`${app.name} Logo`} 
                style={{ width: '120px', height: '120px', borderRadius: '24px', marginBottom: '1rem', objectFit: 'cover', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
              />
            )}
            <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{app.name}</h1>
            {app.tagline && <p style={{ fontSize: '1.2rem', color: '#666' }}>{app.tagline}</p>}
            
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
        </>
      )}

      {/* Legal Docs Section (Shared for both Games and Apps) */}
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