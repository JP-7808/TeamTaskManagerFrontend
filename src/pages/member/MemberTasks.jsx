import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiCalendar, FiFlag, FiCheckCircle, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const MemberTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks', { withCredentials: true });
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus }, { withCredentials: true });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-green-100 text-green-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      High: 'bg-red-100 text-red-800'
    };
    return colors[priority];
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">My Tasks</h1>
        <p className="text-gray-600 mt-2">Manage and track your assigned tasks</p>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setFilter('To Do')}
          className={`px-4 py-2 rounded-lg transition ${filter === 'To Do' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          To Do
        </button>
        <button
          onClick={() => setFilter('In Progress')}
          className={`px-4 py-2 rounded-lg transition ${filter === 'In Progress' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilter('Done')}
          className={`px-4 py-2 rounded-lg transition ${filter === 'Done' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Done
        </button>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTasks.map((task, idx) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-effect rounded-2xl p-6 card-hover"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                <p className="text-gray-600 mt-1">{task.description}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                <div className="flex items-center space-x-1">
                  <FiFlag className="text-xs" />
                  <span>{task.priority}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiCalendar />
                  <span>Due Date:</span>
                </div>
                <span className={`font-semibold ${new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-600' : 'text-gray-800'}`}>
                  {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiCheckCircle />
                  <span>Project:</span>
                </div>
                <span className="font-semibold text-gray-800">{task.project?.name}</span>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                <select
                  value={task.status}
                  onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                  className="input-field"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              {task.status === 'Done' && (
                <div className="flex items-center space-x-2 text-green-600 mt-2">
                  <FiCheckCircle />
                  <span className="text-sm">Completed!</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks found</p>
        </div>
      )}
    </div>
  );
};

export default MemberTasks;