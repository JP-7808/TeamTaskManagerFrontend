import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiUsers, FiUserPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/admin/projects', { withCredentials: true });
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', formData, { withCredentials: true });
      toast.success('Project created successfully');
      setShowModal(false);
      setFormData({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? All tasks will be deleted.')) {
      try {
        await axios.delete(`/api/admin/projects/${projectId}`, { withCredentials: true });
        toast.success('Project deleted successfully');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleAddMember = async () => {
    if (!memberEmail) {
      toast.error('Please enter an email address');
      return;
    }
    try {
      await axios.post(`/api/projects/${selectedProject._id}/members`, 
        { email: memberEmail }, 
        { withCredentials: true }
      );
      toast.success('Member added successfully');
      setShowMemberModal(false);
      setMemberEmail('');
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (projectId, userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await axios.delete(`/api/projects/${projectId}/members/${userId}`, { withCredentials: true });
        toast.success('Member removed successfully');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to remove member');
      }
    }
  };

  const handleTransferOwnership = async (projectId, newAdminId) => {
    if (window.confirm('Transfer project ownership?')) {
      try {
        await axios.put(`/api/admin/projects/${projectId}/transfer`, 
          { newAdminId }, 
          { withCredentials: true }
        );
        toast.success('Project ownership transferred');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to transfer ownership');
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Projects</h1>
          <p className="text-gray-600 mt-2">Manage all projects across your organization</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, idx) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-effect rounded-2xl p-6 card-hover"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
                <p className="text-gray-600 mt-1">{project.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowMemberModal(true);
                  }}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                >
                  <FiUserPlus />
                </button>
                <button
                  onClick={() => handleDeleteProject(project._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiUsers />
                  <span className="text-sm">Team Members</span>
                </div>
                <span className="text-sm font-semibold text-primary-600">
                  {project.members?.length || 0} members
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.members?.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{member.name}</span>
                    {project.admin?._id !== member._id && (
                      <button
                        onClick={() => handleRemoveMember(project._id, member._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX className="text-xs" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Admin: <span className="font-semibold">{project.admin?.name}</span>
                </span>
                <span className="text-gray-600">
                  Tasks: <span className="font-semibold">{project.tasks?.length || 0}</span>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    placeholder="Enter project description"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold mb-4">Add Team Member</h2>
            <p className="text-gray-600 mb-4">Project: {selectedProject.name}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Email
              </label>
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="input-field"
                placeholder="Enter member's email"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={handleAddMember} className="btn-primary flex-1">Add</button>
              <button onClick={() => setShowMemberModal(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;