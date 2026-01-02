import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import {
  fetchProjects,
  createProject,
  deleteProject,
  updateProject,
} from '../api/projects';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const loadProjects = async () => {
    const res = await fetchProjects();
    setProjects(res.data.data);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createProject(form);
    setForm({ name: '', description: '' });
    loadProjects();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    await deleteProject(id);
    loadProjects();
  };
  const handleEdit = async (project) => {
  const name = prompt('Edit project name', project.name);
  if (!name) return;

  const description = prompt(
    'Edit description',
    project.description || ''
  );

  await updateProject(project.id, { name, description });
  loadProjects();
};

  return (
    <Layout>
      <h2>Projects</h2>

      {user.role === 'tenant_admin' && (
        <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
          <input
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <button>Create Project</button>
        </form>
      )}

      <table border="1" cellPadding="8">
        <thead>
  <tr>
    <th>Name</th>
    <th>Status</th>
    <th>Created</th>
    <th>Tasks</th>
    {user.role === 'tenant_admin' && <th>Actions</th>}
  </tr>
</thead>

       <tbody>
  {projects.map((p) => (
    <tr key={p.id}>
      <td>{p.name}</td>
      <td>{p.status}</td>
      <td>{new Date(p.created_at).toLocaleDateString()}</td>

      <td>
        <button
          type="button"
          onClick={() => navigate(`/projects/${p.id}/tasks`)}
        >
          View Tasks
        </button>
      </td>

      {user.role === 'tenant_admin' && (
        <td>
          <button type="button" onClick={() => handleEdit(p)}>
            Edit
          </button>
          <button type="button" onClick={() => handleDelete(p.id)}>
            Delete
          </button>
        </td>
      )}
    </tr>
  ))}
</tbody>

      </table>
    </Layout>
  );
};

export default Projects;
