import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
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
  const [title, setTitle] = useState('');

  const loadTasks = async () => {
    const res = await fetchTasksByProject(projectId);
    setTasks(res.data.data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await createTask(projectId, { title });
    setTitle('');
    loadTasks();
  };

  const handleStatusChange = async (id, status) => {
    await updateTaskStatus(id, status);
    loadTasks();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete task?')) return;
    await deleteTask(id);
    loadTasks();
  };

  return (
    <Layout>
      <h2>Tasks</h2>

      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <button>Add Task</button>
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td>{t.title}</td>
              <td>{t.status}</td>
              <td>
                <button
                  onClick={() =>
                    handleStatusChange(
                      t.id,
                      t.status === 'completed'
                        ? 'pending'
                        : 'completed'
                    )
                  }
                >
                  Toggle Status
                </button>

                {user.role === 'tenant_admin' && (
                  <button onClick={() => handleDelete(t.id)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

export default Tasks;
