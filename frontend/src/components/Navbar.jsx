import { useNavigate } from 'react-router-dom';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
  <strong style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
    SaaS Platform
  </strong>

  {user.role === 'tenant_admin' && (
    <button
      style={styles.link}
      onClick={() => navigate('/users')}
    >
      Users
    </button>
  )}
<button
  style={styles.link}
  onClick={() => navigate('/projects')}
>
  Projects
</button>
<button
  style={styles.link}
  onClick={() => navigate('/dashboard')}
>
  Dashboard
</button>


  <span style={styles.badge}>{user.role}</span>
</div>


      <div style={styles.right}>
        <span>{user.email}</span>
        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: '#1f2937',
    color: '#fff',
  },
  left: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  badge: {
    background: '#2563eb',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '12px',
  },
  right: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  logout: {
    background: '#ef4444',
    border: 'none',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  link: {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '14px',
}

};

export default Navbar;
