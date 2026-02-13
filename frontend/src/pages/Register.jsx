import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tenantName: '',
        subdomain: '',
        adminFullName: '',
        adminEmail: '',
        adminPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register-tenant', formData);
            navigate('/login');
        } catch (err) {
            setError(
                err.response?.data?.message || 'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleRegister} style={styles.form}>
                <h2>Register Tenant</h2>
                {error && <p style={styles.error}>{error}</p>}

                <div style={styles.field}>
                    <label style={styles.label}>Tenant Name</label>
                    <input
                        type="text"
                        name="tenantName"
                        placeholder="e.g. Acme Corp"
                        value={formData.tenantName}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>Subdomain</label>
                    <input
                        type="text"
                        name="subdomain"
                        placeholder="e.g. acme"
                        value={formData.subdomain}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    <small style={styles.helpText}>This will be used for your unique portal URL.</small>
                </div>
                <hr style={styles.divider} />
                <div style={styles.field}>
                    <label style={styles.label}>Admin Full Name</label>
                    <input
                        type="text"
                        name="adminFullName"
                        placeholder="Your full name"
                        value={formData.adminFullName}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>Admin Email</label>
                    <input
                        type="email"
                        name="adminEmail"
                        placeholder="admin@example.com"
                        value={formData.adminEmail}
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>Admin Password</label>
                    <input
                        type="password"
                        name="adminPassword"
                        placeholder="Min 8 characters"
                        value={formData.adminPassword}
                        onChange={handleChange}
                        required
                        minLength="8"
                        style={styles.input}
                    />
                </div>

                <button type="submit" disabled={loading} style={styles.button}>
                    {loading ? 'Registering...' : 'Register'}
                </button>

                <p style={styles.linkText}>
                    Already have an account? <Link to="/login">Login here</Link>
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
        fontFamily: 'Arial, sans-serif',
    },
    form: {
        width: '350px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    label: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        padding: '10px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    helpText: {
        fontSize: '11px',
        color: '#666',
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #eee',
        margin: '10px 0',
    },
    button: {
        padding: '10px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    error: {
        fontSize: '14px',
        textAlign: 'center',
    },
    linkText: {
        textAlign: 'center',
        fontSize: '14px',
    }
};

export default Register;
