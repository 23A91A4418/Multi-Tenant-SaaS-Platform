import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import TaskModal from '../components/TaskModal';
import {
  fetchTasksByProject,
  createTask,
  updateTaskStatus,
  deleteTask,
} from '../api/tasks';

const Tasks = () => {
  const { projectId } = useParams();
  const user = JSON.parse(localStorage.getItem('user'));

  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const loadTasks = async () => {
    try {
      const res = await fetchTasksByProject(projectId);
      setTasks(res.data.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const handleOpenCreate = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedTask) {
        // Update logic if needed, but for now only status is toggled in current API
        // Expanding to full update would require putTask API
        await updateTaskStatus(selectedTask.id, formData.status);
      } else {
        await createTask(projectId, formData);
      }
      setIsModalOpen(false);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    try {
      await updateTaskStatus(id, nextStatus);
      loadTasks();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <Layout>
      <div style={styles.header}>
        <h2>Tasks</h2>
        <button onClick={handleOpenCreate} style={styles.createBtn}>
          + Add Task
        </button>
      </div>

      <table border="1" cellPadding="12" style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.description || '-'}</td>
              <td>
                <span style={{ ...styles.badge, ...styles[t.priority] }}>
                  {t.priority}
                </span>
              </td>
              <td>
                <span style={{ ...styles.badge, ...styles[t.status] }}>
                  {t.status.replace('_', ' ')}
                </span>
              </td>
              <td>{new Date(t.created_at).toLocaleDateString()}</td>
              <td style={styles.actions}>
                <button
                  type="button"
                  onClick={() => handleStatusToggle(t.id, t.status)}
                  style={styles.toggleBtn}
                >
                  Toggle Status
                </button>

                {user.role === 'tenant_admin' && (
                  <button onClick={() => handleDelete(t.id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tasks.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>No tasks found for this project.</p>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        task={selectedTask}
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
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    textTransform: 'capitalize',
  },
  low: { backgroundColor: '#e2e3e5', color: '#383d41' },
  medium: { backgroundColor: '#fff3cd', color: '#856404' },
  high: { backgroundColor: '#f8d7da', color: '#721C24' },
  todo: { backgroundColor: '#cfe2ff', color: '#084298' },
  in_progress: { backgroundColor: '#fff3cd', color: '#856404' },
  completed: { backgroundColor: '#d1e7dd', color: '#0f5132' },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  toggleBtn: {
    padding: '6px 12px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#DC3545',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  }
};

export default Tasks;
