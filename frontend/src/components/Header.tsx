import React, { useState } from 'react';
import { Search, Bell, Settings, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentWorkspace?: string;
}

const Header: React.FC<HeaderProps> = ({ currentWorkspace = 'Personal' }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-notion-gray-200 px-4 h-12 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-notion-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-sm bg-notion-gray-50 border border-notion-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-notion-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Center - Current Workspace */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-notion-gray-50 cursor-pointer">
          <div className="w-4 h-4 bg-notion-blue-500 rounded-sm"></div>
          <span className="text-sm font-medium text-notion-gray-900">{currentWorkspace}</span>
          <ChevronDown className="w-3 h-3 text-notion-gray-500" />
        </div>
      </div>

      {/* Right Side - Actions & User */}
      <div className="flex-1 flex items-center justify-end space-x-2">
        {/* Notifications */}
        <button className="p-1.5 text-notion-gray-600 hover:text-notion-gray-900 hover:bg-notion-gray-100 rounded-md transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button className="p-1.5 text-notion-gray-600 hover:text-notion-gray-900 hover:bg-notion-gray-100 rounded-md transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 p-1.5 text-notion-gray-600 hover:text-notion-gray-900 hover:bg-notion-gray-100 rounded-md transition-colors"
          >
            <img
              src="https://ui-avatars.com/api/?name=User&background=2383e2&color=fff&size=24"
              alt="User"
              className="w-6 h-6 rounded-full"
            />
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-notion-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                <div className="px-4 py-2 border-b border-notion-gray-100">
                  <div className="text-sm font-medium text-notion-gray-900">User</div>
                  <div className="text-xs text-notion-gray-500">user@example.com</div>
                </div>
                <button className="flex items-center w-full px-4 py-2 text-sm text-notion-gray-700 hover:bg-notion-gray-50">
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-notion-gray-700 hover:bg-notion-gray-50">
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </button>
                <div className="border-t border-notion-gray-100 my-1"></div>
                <button className="flex items-center w-full px-4 py-2 text-sm text-notion-gray-700 hover:bg-notion-gray-50">
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;