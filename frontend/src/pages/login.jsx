import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
          <label>
            <input
              type="radio"
              value="tenant"
              checked={loginType === 'tenant'}
              onChange={() => setLoginType('tenant')}
            />
            Tenant User
          </label>

          <label>
            <input
              type="radio"
              value="super_admin"
              checked={loginType === 'super_admin'}
              onChange={() => setLoginType('super_admin')}
            />
            Super Admin
          </label>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* TENANT SUBDOMAIN ONLY FOR TENANT LOGIN */}
        {loginType === 'tenant' && (
          <input
            type="text"
            placeholder="Tenant Subdomain"
            value={tenantSubdomain}
            onChange={(e) => setTenantSubdomain(e.target.value)}
            required
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
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
  },
  form: {
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  toggle: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  error: {
    color: 'red',
    fontSize: '14px',
  },
};

export default Login;
