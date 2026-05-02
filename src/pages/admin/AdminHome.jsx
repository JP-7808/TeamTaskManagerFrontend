import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiFolder, FiCheckCircle, FiClock, 
  FiTrendingUp, FiAlertCircle, FiActivity 
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard/stats', { withCredentials: true });
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get('/api/admin/activity', { withCredentials: true });
      setRecentActivity(response.data.activity);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  const taskStatusData = stats?.tasks ? [
    { name: 'To Do', value: stats.tasks.todo, color: '#F59E0B' },
    { name: 'In Progress', value: stats.tasks.inProgress, color: '#3B82F6' },
    { name: 'Done', value: stats.tasks.completed, color: '#10B981' }
  ] : [];

  const weeklyData = stats?.weeklyActivity || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome Back, Admin!</h1>
        <p className="text-primary-100">Here's what's happening with your team today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.users?.total || 0}
          icon={FiUsers}
          color="from-blue-500 to-blue-700"
          change={12}
        />
        <StatCard
          title="Total Projects"
          value={stats?.projects?.total || 0}
          icon={FiFolder}
          color="from-green-500 to-green-700"
          change={8}
        />
        <StatCard
          title="Completed Tasks"
          value={stats?.tasks?.completed || 0}
          icon={FiCheckCircle}
          color="from-emerald-500 to-emerald-700"
          change={23}
        />
        <StatCard
          title="Overdue Tasks"
          value={stats?.tasks?.overdue || 0}
          icon={FiAlertCircle}
          color="from-red-500 to-red-700"
          change={-5}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Task Status Distribution</h3>
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

        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tasks" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FiActivity className="mr-2 text-primary-600" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivity.recentTasks?.slice(0, 5).map((task, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800">{task.title}</p>
                <p className="text-sm text-gray-600">Created by {task.createdBy}</p>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(task.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminHome;