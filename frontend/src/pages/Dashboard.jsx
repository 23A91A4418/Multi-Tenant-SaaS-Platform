import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const [usersCount, setUsersCount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [tasksCount, setTasksCount] = useState(0);
  const [taskNames, setTaskNames] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      // USERS COUNT (tenant admin only)
      if (user.role === 'tenant_admin') {
        const usersRes = await api.get(
          `/tenants/${user.tenantId}/users`
        );
        setUsersCount(usersRes.data.data.length);
      }

      // PROJECTS
      const projectsRes = await api.get('/projects');
      setProjects(projectsRes.data.data);

      // TASKS (from all projects)
      let totalTasks = 0;
      let taskTitles = [];

      for (const project of projectsRes.data.data) {
        const tasksRes = await api.get(
          `/projects/${project.id}/tasks`
        );
        totalTasks += tasksRes.data.data.length;
        taskTitles.push(
          ...tasksRes.data.data.map((t) => t.title)
        );
      }

      setTasksCount(totalTasks);
      setTaskNames(taskTitles.slice(0, 5)); // recent 5 tasks
    } catch (err) {
      console.error('Dashboard load failed', err);
    }
  };

  return (
    <Layout>
      <h2>Dashboard</h2>

      {/* STATS */}
      <div style={styles.stats}>
        {user.role === 'tenant_admin' && (
          <div style={styles.card}>
            <h3>{usersCount}</h3>
            <p>Total Users</p>
          </div>
        )}

        <div style={styles.card}>
          <h3>{projects.length}</h3>
          <p>Total Projects</p>
        </div>

        <div style={styles.card}>
          <h3>{tasksCount}</h3>
          <p>Total Tasks</p>
        </div>
      </div>

      {/* PROJECT LIST */}
      <div style={styles.section}>
        <h3>Projects</h3>
        <ul>
          {projects.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </div>

      {/* TASK LIST */}
      <div style={styles.section}>
        <h3>Recent Tasks</h3>
        <ul>
          {taskNames.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

const styles = {
  stats: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  },
  card: {
    background: '#ced9edff',
    padding: '20px',
    borderRadius: '8px',
    width: '150px',
    textAlign: 'center',
  },
  section: {
    marginTop: '20px',
  },
};

export default Dashboard;
