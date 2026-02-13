import { useState, useEffect } from 'react';

const UserModal = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'user'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                password: '', // Don't show password
                fullName: user.full_name || '',
                role: user.role || 'user'
            });
        } else {
            setFormData({ email: '', password: '', fullName: '', role: 'user' });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3>{user ? 'Edit User' : 'Add New User'}</h3>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.field}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={styles.input}
                            disabled={!!user}
                        />
                    </div>
                    {!user && (
                        <div style={styles.field}>
                            <label>Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                style={styles.input}
                            />
                        </div>
                    )}
                    <div style={styles.field}>
                        <label>Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={styles.input}
                        >
                            <option value="user">User</option>
                            <option value="tenant_admin">Tenant Admin</option>
                        </select>
                    </div>
                    <div style={styles.actions}>
                        <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                        <button type="submit" style={styles.saveBtn}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '8px',
        width: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    input: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '8px',
    },
    cancelBtn: {
        padding: '8px 16px',
        backgroundColor: '#f1f1f1',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    saveBtn: {
        padding: '8px 16px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    }
};

export default UserModal;
