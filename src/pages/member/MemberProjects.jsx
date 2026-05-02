import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiUsers, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const MemberProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects', { withCredentials: true });
      setProjects(response.data.projects);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">My Projects</h1>
        <p className="text-gray-600 mt-2">View all projects you're participating in</p>
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
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">{project.name}</h3>
              <p className="text-gray-600 mt-1">{project.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiUsers />
                  <span>Team Members:</span>
                </div>
                <span className="font-semibold text-gray-800">{project.members?.length || 0}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiCheckCircle />
                  <span>Total Tasks:</span>
                </div>
                <span className="font-semibold text-gray-800">{project.tasks?.length || 0}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiUsers />
                  <span>Project Admin:</span>
                </div>
                <span className="font-semibold text-primary-600">{project.admin?.name}</span>
              </div>
            </div>

            {/* Team Members List */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Team Members</h4>
              <div className="flex flex-wrap gap-2">
                {project.members?.map((member) => (
                  <div
                    key={member._id}
                    className={`px-3 py-1 rounded-full text-sm ${
                      member._id === project.admin?._id
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {member.name}
                    {member._id === project.admin?._id && ' (Admin)'}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">You haven't been added to any projects yet</p>
        </div>
      )}
    </div>
  );
};

export default MemberProjects;