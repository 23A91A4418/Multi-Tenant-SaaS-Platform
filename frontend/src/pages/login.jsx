import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState('tenant'); // tenant | super_admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSubdomain, setTenantSubdomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      let res;

      if (loginType === 'super_admin') {
        // 🔐 Super Admin Login
        res = await api.post('/auth/super-admin/login', {
          email: email.trim(),
          password,
        });
      } else {
        // 🏢 Tenant User Login
        res = await api.post('/auth/login', {
          email: email.trim(),
          password,
          tenantSubdomain: tenantSubdomain.trim(),
        });
      }

      const { token, user } = res.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2>Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        {/* LOGIN TYPE TOGGLE */}
        <div style={styles.toggle}>
          <label style={styles.toggleLabel(loginType === 'tenant')}>
            <input
              type="radio"
              style={{ display: 'none' }}
              value="tenant"
              checked={loginType === 'tenant'}
              onChange={() => setLoginType('tenant')}
            />
            Tenant User
          </label>

          <label style={styles.toggleLabel(loginType === 'super_admin')}>
            <input
              type="radio"
              style={{ display: 'none' }}
              value="super_admin"
              checked={loginType === 'super_admin'}
              onChange={() => setLoginType('super_admin')}
            />
            Super Admin
          </label>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="e.g. admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        {/* TENANT SUBDOMAIN ONLY FOR TENANT LOGIN */}
        {loginType === 'tenant' && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tenant Subdomain</label>
            <input
              type="text"
              placeholder="e.g. acme"
              value={tenantSubdomain}
              onChange={(e) => setTenantSubdomain(e.target.value)}
              required
              style={styles.input}
            />
          </div>
        )}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p style={styles.footerText}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f7f6',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  form: {
    width: '350px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '30px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  toggle: {
    display: 'flex',
    backgroundColor: '#f1f1f1',
    padding: '4px',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  toggleLabel: (active) => ({
    flex: 1,
    textAlign: 'center',
    padding: '8px 4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: active ? 'bold' : 'normal',
    backgroundColor: active ? '#fff' : 'transparent',
    borderRadius: '4px',
    transition: 'all 0.2s',
  }),
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    marginTop: '10px',
  },
  error: {
    color: '#DC3545',
    backgroundColor: '#F8D7DA',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '13px',
    textAlign: 'center',
    margin: '0',
    border: '1px solid #F5C6CB',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#007BFF',
    textDecoration: 'none',
    fontWeight: '600',
  }
};

export default Login;
