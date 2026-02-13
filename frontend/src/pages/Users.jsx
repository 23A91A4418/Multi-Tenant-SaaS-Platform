import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import UserModal from '../components/UserModal';
import { fetchUsersByTenant, addUserToTenant } from '../api/users';

const Users = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await fetchUsersByTenant(user.tenantId);
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAdd = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      await addUserToTenant(user.tenantId, formData);
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add user');
    }
  };

  if (user.role !== 'tenant_admin' && user.role !== 'super_admin') {
    return <Layout><p>Access denied</p></Layout>;
  }

  return (
    <Layout>
      <div style={styles.header}>
        <h2>Users</h2>
        {user.role === 'tenant_admin' && (
          <button onClick={handleOpenAdd} style={styles.addBtn}>
            + Add User
          </button>
        )}
      </div>

      <table border="1" cellPadding="12" style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>
                <span style={{ ...styles.badge, ...styles[u.role] }}>
                  {u.role.replace('_', ' ')}
                </span>
              </td>
              <td>
                <span style={{ color: u.is_active ? '#28A745' : '#DC3545', fontWeight: 'bold' }}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        user={selectedUser}
      />
    </Layout>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addBtn: {
    padding: '10px 20px',
    backgroundColor: '#28A745',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px',
  },
  thead: {
    backgroundColor: '#f8f9fa',
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  super_admin: { backgroundColor: '#343A40', color: '#fff' },
  tenant_admin: { backgroundColor: '#17A2B8', color: '#fff' },
  user: { backgroundColor: '#6C757D', color: '#fff' },
};

export default Users;
