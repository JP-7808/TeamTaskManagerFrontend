import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MemberHome from './member/MemberHome';
import MemberTasks from './member/MemberTasks';
import MemberProjects from './member/MemberProjects';

const MemberDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<MemberHome />} />
          <Route path="/my-tasks" element={<MemberTasks />} />
          <Route path="/projects" element={<MemberProjects />} />
          <Route path="*" element={<Navigate to="/member" />} />
        </Routes>
      </div>
    </div>
  );
};

export default MemberDashboard;