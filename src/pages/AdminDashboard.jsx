import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminHome from './admin/AdminHome';
import AdminProjects from './admin/AdminProjects';
import AdminTasks from './admin/AdminTasks';
import AdminUsers from './admin/AdminUsers';
import AdminAnalytics from './admin/AdminAnalytics';
import { AuthProvider } from '../context/AuthContext';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/projects" element={<AdminProjects />} />
          <Route path="/tasks" element={<AdminTasks />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/analytics" element={<AdminAnalytics />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;