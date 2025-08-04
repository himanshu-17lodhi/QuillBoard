import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  Settings,
  PlusCircle,
  Search,
  Database,
  Users,
  Folder
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    workspaces: true,
    pages: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: Home, label: 'Home', path: '/', exact: true },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className={`bg-notion-gray-25 border-r border-notion-gray-200 flex flex-col transition-all duration-200 ${
      isCollapsed ? 'w-12' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      <div className="p-3 border-b border-notion-gray-200">
        {!isCollapsed && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-notion-blue-500 rounded flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-notion-gray-900">QuillBoard</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-3">
        <div className="px-2 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                isActive(item.path)
                  ? 'bg-notion-gray-200 text-notion-gray-900'
                  : 'text-notion-gray-600 hover:bg-notion-gray-100 hover:text-notion-gray-900'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* Workspaces Section */}
        {!isCollapsed && (
          <div className="mt-6">
            <div className="px-2">
              <button
                onClick={() => toggleSection('workspaces')}
                className="flex items-center w-full px-2 py-1 text-sm text-notion-gray-600 hover:text-notion-gray-900 rounded-md hover:bg-notion-gray-100"
              >
                {expandedSections.workspaces ? (
                  <ChevronDown className="w-3 h-3 mr-1" />
                ) : (
                  <ChevronRight className="w-3 h-3 mr-1" />
                )}
                <Users className="w-4 h-4 mr-2" />
                <span className="flex-1 text-left">Workspaces</span>
                <PlusCircle className="w-3 h-3 opacity-0 group-hover:opacity-100" />
              </button>
              
              {expandedSections.workspaces && (
                <div className="ml-6 mt-1 space-y-1">
                  <Link
                    to="/workspaces"
                    className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${
                      isActive('/workspaces')
                        ? 'bg-notion-gray-200 text-notion-gray-900'
                        : 'text-notion-gray-600 hover:bg-notion-gray-100 hover:text-notion-gray-900'
                    }`}
                  >
                    <Folder className="w-4 h-4 mr-2" />
                    <span>All Workspaces</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pages Section */}
        {!isCollapsed && (
          <div className="mt-4">
            <div className="px-2">
              <button
                onClick={() => toggleSection('pages')}
                className="flex items-center w-full px-2 py-1 text-sm text-notion-gray-600 hover:text-notion-gray-900 rounded-md hover:bg-notion-gray-100"
              >
                {expandedSections.pages ? (
                  <ChevronDown className="w-3 h-3 mr-1" />
                ) : (
                  <ChevronRight className="w-3 h-3 mr-1" />
                )}
                <FileText className="w-4 h-4 mr-2" />
                <span className="flex-1 text-left">Pages</span>
                <PlusCircle className="w-3 h-3 opacity-0 group-hover:opacity-100" />
              </button>
              
              {expandedSections.pages && (
                <div className="ml-6 mt-1 space-y-1">
                  <div className="flex items-center px-2 py-1 text-sm text-notion-gray-500">
                    <span>No pages yet</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Databases Section */}
        {!isCollapsed && (
          <div className="mt-4">
            <div className="px-2">
              <button
                className="flex items-center w-full px-2 py-1 text-sm text-notion-gray-600 hover:text-notion-gray-900 rounded-md hover:bg-notion-gray-100"
              >
                <Database className="w-4 h-4 mr-2" />
                <span className="flex-1 text-left">Databases</span>
                <PlusCircle className="w-3 h-3 opacity-0 group-hover:opacity-100" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Toggle */}
      <div className="p-2 border-t border-notion-gray-200">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 text-notion-gray-600 hover:text-notion-gray-900 hover:bg-notion-gray-100 rounded-md transition-colors"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;