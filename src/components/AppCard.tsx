import { Link } from 'react-router-dom';

interface AppCardProps {
  id: string;
  name: string;
  description?: string;
}

export const AppCard = ({ id, name, description }: AppCardProps) => {
  return (
    <Link to={`/${id}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>{name}</h3>
        <span style={{ fontSize: '1.2rem' }}>&rarr;</span>
      </div>
      {description && <p style={{ color: '#666', margin: 0 }}>{description}</p>}
      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#2563eb', fontWeight: 500 }}>
        View Legal Docs
      </div>
    </Link>
  );
};