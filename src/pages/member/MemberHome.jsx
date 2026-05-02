import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const MemberHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentTasks();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats', { withCredentials: true });
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const response = await axios.get('/api/tasks', { withCredentials: true });
      setRecentTasks(response.data.tasks.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus }, { withCredentials: true });
      toast.success('Task status updated');
      fetchDashboardStats();
      fetchRecentTasks();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  if (loading) return <LoadingSpinner />;

  const taskStatusData = stats?.tasksByStatus ? [
    { name: 'To Do', value: stats.tasksByStatus['To Do'], color: '#F59E0B' },
    { name: 'In Progress', value: stats.tasksByStatus['In Progress'], color: '#3B82F6' },
    { name: 'Done', value: stats.tasksByStatus['Done'], color: '#10B981' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard!</h1>
        <p className="text-primary-100">Track your tasks and stay productive.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          icon={FiCheckCircle}
          color="from-blue-500 to-blue-700"
        />
        <StatCard
          title="In Progress"
          value={stats?.tasksByStatus?.['In Progress'] || 0}
          icon={FiClock}
          color="from-yellow-500 to-yellow-700"
        />
        <StatCard
          title="Completed"
          value={stats?.tasksByStatus?.['Done'] || 0}
          icon={FiCheckCircle}
          color="from-green-500 to-green-700"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueTasks || 0}
          icon={FiAlertCircle}
          color="from-red-500 to-red-700"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">My Task Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Projects Overview</h3>
          <div className="text-center py-12">
            <p className="text-4xl font-bold text-primary-600">{stats?.totalProjects || 0}</p>
            <p className="text-gray-600 mt-2">Active Projects</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Tasks</h3>
        <div className="space-y-4">
          {recentTasks.map((task) => (
            <div key={task._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-800">{task.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    task.status === 'Done' ? 'bg-green-100 text-green-800' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                  <span className="flex items-center space-x-1 text-xs text-gray-600">
                    <FiCalendar />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
              {task.status !== 'Done' && (
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default MemberHome;