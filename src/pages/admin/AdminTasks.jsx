import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit2, FiTrash2, FiFilter, FiCalendar, 
  FiFlag, FiUser, FiX, FiCheckCircle, FiClock,
  FiAlertCircle, FiSearch
} from 'react-icons/fi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ 
    status: '', 
    priority: '', 
    projectId: '' 
  });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    assignedTo: '',
    projectId: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.projectId) params.append('projectId', filters.projectId);
      
      const response = await axios.get(`/api/admin/tasks?${params.toString()}`, { 
        withCredentials: true 
      });
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/admin/projects', { withCredentials: true });
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', { withCredentials: true });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!formData.projectId) {
      toast.error('Please select a project');
      return;
    }
    if (!formData.assignedTo) {
      toast.error('Please assign a user');
      return;
    }
    
    try {
      await axios.post('/api/tasks', formData, { withCredentials: true });
      toast.success('Task created successfully');
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/tasks/${selectedTask._id}`, formData, { withCredentials: true });
      toast.success('Task updated successfully');
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    try {
      await axios.delete(`/api/admin/tasks/${selectedTask._id}`, { withCredentials: true });
      toast.success('Task deleted successfully');
      setShowDeleteModal(false);
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleBulkDelete = async () => {
    const selectedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const taskIds = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    if (taskIds.length === 0) {
      toast.error('Please select tasks to delete');
      return;
    }

    if (window.confirm(`Delete ${taskIds.length} task(s)? This action cannot be undone.`)) {
      try {
        await axios.post('/api/admin/tasks/bulk-delete', { taskIds }, { withCredentials: true });
        toast.success(`${taskIds.length} task(s) deleted successfully`);
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete tasks');
      }
    }
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.split('T')[0],
      priority: task.priority,
      assignedTo: task.assignedTo?._id || task.assignedTo,
      projectId: task.project?._id || task.project
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'Medium',
      assignedTo: '',
      projectId: ''
    });
    setIsEditing(false);
    setSelectedTask(null);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-green-100 text-green-800 border-green-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      High: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'To Do': 'bg-gray-100 text-gray-800 border-gray-200',
      'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'Done': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'To Do': return <FiClock className="mr-1" />;
      case 'In Progress': return <FiAlertCircle className="mr-1" />;
      case 'Done': return <FiCheckCircle className="mr-1" />;
      default: return null;
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Tasks Management</h1>
          <p className="text-gray-600 mt-2">Create, edit, and manage all tasks across projects</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>Create Task</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setFilters({ status: '', priority: '', projectId: '' })}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="input-field"
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select
            value={filters.projectId}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
            className="input-field"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>
        </div>

        {tasks.length > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {filteredTasks.length} task(s) found
            </span>
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
            >
              <FiTrash2 />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="glass-effect rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tasks Found</h3>
          <p className="text-gray-600">Create your first task to get started</p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary mt-4 inline-flex items-center space-x-2"
          >
            <FiPlus />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTasks.map((task, idx) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-effect rounded-2xl p-6 card-hover"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <input 
                      type="checkbox" 
                      value={task._id} 
                      className="mt-1 w-4 h-4 text-primary-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center ${getPriorityColor(task.priority)}`}>
                          <FiFlag className="mr-1 text-xs" />
                          {task.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{task.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FiCalendar className="text-primary-500" />
                          <span className="font-medium">Due Date:</span>
                          <span className={new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                          </span>
                          {new Date(task.dueDate) < new Date() && task.status !== 'Done' && (
                            <span className="text-red-600 text-xs font-semibold">(Overdue)</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FiUser className="text-primary-500" />
                          <span className="font-medium">Assigned To:</span>
                          <span className="text-gray-700">{task.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FiCheckCircle className="text-primary-500" />
                          <span className="font-medium">Project:</span>
                          <span className="text-gray-700">{task.project?.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FiUser className="text-primary-500" />
                          <span className="font-medium">Created By:</span>
                          <span className="text-gray-700">{task.createdBy?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center justify-center"
                    title="Edit Task"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center"
                    title="Delete Task"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Task Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full mx-4 my-8 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold gradient-text">
                  {isEditing ? 'Edit Task' : 'Create New Task'}
                </h2>
              </div>
              
              <form onSubmit={isEditing ? handleUpdateTask : handleCreateTask} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input-field"
                      placeholder="Enter task title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input-field"
                      placeholder="Enter task description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority *
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="input-field"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project *
                      </label>
                      <select
                        value={formData.projectId}
                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                          <option key={project._id} value={project._id}>{project.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign To *
                      </label>
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        className="input-field"
                        required
                      >
                        <option value="">Select User</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button type="submit" className="btn-primary flex-1">
                    {isEditing ? 'Update Task' : 'Create Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiTrash2 className="text-red-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete Task</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the task "{selectedTask.title}"? This action cannot be undone.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteTask}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition flex-1"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTasks;