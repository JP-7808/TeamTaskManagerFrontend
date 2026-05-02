import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { FiTrendingUp, FiAward, FiStar } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard/stats', { withCredentials: true });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const performanceData = stats?.topPerformers?.map(performer => ({
    name: performer.name.split(' ')[0],
    tasks: performer.completedTasks,
    rate: parseFloat(performer.completionRate)
  })) || [];

  const projectData = stats?.topProjects?.map(project => ({
    name: project.name,
    tasks: project.taskCount,
    members: project.memberCount
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
        <p className="text-gray-600 mt-2">Deep insights into your team's performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Completion Rate</h3>
            <FiTrendingUp className="text-green-500 text-2xl" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.tasks?.completionRate}%</p>
          <p className="text-sm text-gray-600 mt-2">Overall task completion</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Active Projects</h3>
            <FiStar className="text-yellow-500 text-2xl" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.projects?.active}</p>
          <p className="text-sm text-gray-600 mt-2">Out of {stats?.projects?.total} total</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Team Members</h3>
            <FiAward className="text-blue-500 text-2xl" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats?.users?.members}</p>
          <p className="text-sm text-gray-600 mt-2">Active contributors</p>
        </motion.div>
      </div>

      {/* Top Performers Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Top Performers</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="tasks" fill="#3B82F6" name="Completed Tasks" />
            <Bar yAxisId="right" dataKey="rate" fill="#10B981" name="Completion Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Projects Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Most Active Projects</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={projectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="tasks" fill="#3B82F6" name="Total Tasks" />
            <Bar dataKey="members" fill="#10B981" name="Team Members" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Task Distribution Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-effect rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">Task Distribution by Priority</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={[
                { name: 'High', value: stats?.tasks?.highPriority || 0 },
                { name: 'Medium', value: stats?.tasks?.total - (stats?.tasks?.highPriority || 0) - (stats?.tasks?.lowPriority || 0) },
                { name: 'Low', value: stats?.tasks?.lowPriority || 0 }
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
            >
              {projectData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;