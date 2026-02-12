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

                <input
                    type="text"
                    name="tenantName"
                    placeholder="Tenant Name"
                    value={formData.tenantName}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="text"
                    name="subdomain"
                    placeholder="Subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="text"
                    name="adminFullName"
                    placeholder="Admin Full Name"
                    value={formData.adminFullName}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="email"
                    name="adminEmail"
                    placeholder="Admin Email"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    name="adminPassword"
                    placeholder="Password"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    required
                    style={styles.input}
                />

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
    input: {
        padding: '10px',
        fontSize: '14px',
        borderRadius: '4px',
        border: '1px solid #ccc',
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
        color: 'red',
        fontSize: '14px',
        textAlign: 'center',
    },
    linkText: {
        textAlign: 'center',
        fontSize: '14px',
    }
};

export default Register;
