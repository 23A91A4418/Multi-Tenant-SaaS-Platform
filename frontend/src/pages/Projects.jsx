import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ProjectModal from '../components/ProjectModal';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  const loadProjects = async () => {
    try {
      const res = await fetchProjects();
      setProjects(res.data.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenCreate = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, formData);
      } else {
        await createProject(formData);
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(id);
      loadProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  return (
    <Layout>
      <div style={styles.header}>
        <h2>Projects</h2>
        {user.role === 'tenant_admin' && (
          <button onClick={handleOpenCreate} style={styles.createBtn}>
            + Create Project
          </button>
        )}
      </div>

      <table border="1" cellPadding="12" style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Tasks</th>
            {user.role === 'tenant_admin' && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td><strong>{p.name}</strong></td>
              <td>{p.description || '-'}</td>
              <td>
                <span style={{ ...styles.status, ...styles[p.status] }}>
                  {p.status}
                </span>
              </td>
              <td>{new Date(p.created_at).toLocaleDateString()}</td>

              <td>
                <button
                  type="button"
                  onClick={() => navigate(`/projects/${p.id}/tasks`)}
                  style={styles.viewBtn}
                >
                  View Tasks
                </button>
              </td>

              {user.role === 'tenant_admin' && (
                <td style={styles.actions}>
                  <button type="button" onClick={() => handleOpenEdit(p)} style={styles.editBtn}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(p.id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {projects.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>No projects found.</p>
      )}

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        project={selectedProject}
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
  createBtn: {
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
  status: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  active: { backgroundColor: '#D1ECF1', color: '#0C5460' },
  archived: { backgroundColor: '#F8D7DA', color: '#721C24' },
  completed: { backgroundColor: '#D4EDDA', color: '#155724' },
  viewBtn: {
    padding: '6px 12px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    padding: '6px 12px',
    backgroundColor: '#FFC107',
    color: '#000',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#DC3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default Projects;
