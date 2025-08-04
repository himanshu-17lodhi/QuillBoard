import React from 'react';
import { Plus, Users, FileText, Database, Calendar } from 'lucide-react';

const Workspaces: React.FC = () => {
  const workspaces = [
    {
      id: 1,
      name: 'Sample Workspace',
      icon: '📝',
      description: 'This is a sample workspace to get you started. Create your first workspace to begin organizing your content.',
      pages: 3,
      databases: 2,
      members: 1,
      lastUpdated: '2 days ago',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      id: 2,
      name: 'Personal Workspace',
      icon: '🏠',
      description: 'Your personal space for notes, ideas, and personal projects.',
      pages: 8,
      databases: 1,
      members: 1,
      lastUpdated: '1 day ago',
      color: 'bg-green-50 border-green-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-notion-gray-900">Workspaces</h1>
          <p className="text-notion-gray-600 mt-1">Organize your projects and collaborate with your team</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-notion-blue-600 text-white rounded-lg hover:bg-notion-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-blue-500 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Workspace
        </button>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Existing workspaces */}
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className={`bg-white border-2 ${workspace.color} rounded-lg p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group`}
          >
            {/* Workspace Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{workspace.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-notion-gray-900 group-hover:text-notion-blue-600 transition-colors">
                    {workspace.name}
                  </h3>
                  <div className="flex items-center text-sm text-notion-gray-500 space-x-3 mt-1">
                    <span className="flex items-center">
                      <FileText className="w-3 h-3 mr-1" />
                      {workspace.pages} pages
                    </span>
                    <span className="flex items-center">
                      <Database className="w-3 h-3 mr-1" />
                      {workspace.databases} databases
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-notion-gray-400 group-hover:text-notion-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-notion-gray-600 mb-4 line-clamp-2">
              {workspace.description}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-notion-gray-100">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-notion-gray-400" />
                <span className="text-xs text-notion-gray-500">{workspace.members} member{workspace.members > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-notion-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{workspace.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}

        {/* New workspace card */}
        <div className="bg-notion-gray-50 border-2 border-dashed border-notion-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-notion-gray-400 hover:bg-notion-gray-100 transition-all duration-200 cursor-pointer group min-h-[240px]">
          <div className="w-12 h-12 bg-notion-gray-200 rounded-lg flex items-center justify-center mb-4 group-hover:bg-notion-blue-100 transition-colors">
            <Plus className="w-6 h-6 text-notion-gray-500 group-hover:text-notion-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-notion-gray-900 mb-2">Create New Workspace</h3>
          <p className="text-sm text-notion-gray-600">
            Start a new project or organize your content in a dedicated workspace
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-notion-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-notion-gray-600">Total Workspaces</p>
              <p className="text-2xl font-semibold text-notion-gray-900">{workspaces.length}</p>
            </div>
            <div className="w-8 h-8 bg-notion-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-notion-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-notion-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-notion-gray-600">Total Pages</p>
              <p className="text-2xl font-semibold text-notion-gray-900">
                {workspaces.reduce((sum, w) => sum + w.pages, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-notion-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-notion-gray-600">Total Databases</p>
              <p className="text-2xl font-semibold text-notion-gray-900">
                {workspaces.reduce((sum, w) => sum + w.databases, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-notion-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-notion-gray-600">Team Members</p>
              <p className="text-2xl font-semibold text-notion-gray-900">
                {workspaces.reduce((sum, w) => sum + w.members, 0)}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspaces;