import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              <i className="fas fa-feather-alt mr-2"></i>QuillBoard
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/workspaces" className="text-gray-700 hover:text-indigo-600">
              <i className="fas fa-layer-group mr-1"></i>Workspaces
            </Link>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-indigo-600">
                <img 
                  src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff" 
                  alt="User" 
                  className="w-8 h-8 rounded-full mr-2"
                />
                User
                <i className="fas fa-chevron-down ml-1"></i>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <i className="fas fa-user mr-2"></i>Profile
                </a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <i className="fas fa-sign-out-alt mr-2"></i>Logout
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;