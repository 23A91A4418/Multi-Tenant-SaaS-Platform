import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { fetchUsersByTenant, addUserToTenant } from '../api/users';

const Users = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const loadUsers = async () => {
    const res = await fetchUsersByTenant(user.tenantId);
    setUsers(res.data.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addUserToTenant(user.tenantId, form);
    setForm({ email: '', password: '', fullName: '' });
    loadUsers();
  };

  if (user.role !== 'tenant_admin') {
    return <Layout><p>Access denied</p></Layout>;
  }

  return (
    <Layout>
      <h2>Users</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />
        <button>Add User</button>
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.is_active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Users;
