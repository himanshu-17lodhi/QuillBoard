import React from 'react';
import { Users, FileText, Database, Plus, Clock, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const quickActions = [
    {
      icon: Users,
      title: 'Create Workspace',
      description: 'Start a new collaborative workspace',
      color: 'bg-notion-blue-50 text-notion-blue-600',
      href: '/workspaces/new',
    },
    {
      icon: FileText,
      title: 'New Page',
      description: 'Create a document or note',
      color: 'bg-green-50 text-green-600',
      href: '/pages/new',
    },
    {
      icon: Database,
      title: 'New Database',
      description: 'Organize structured information',
      color: 'bg-purple-50 text-purple-600',
      href: '/databases/new',
    },
  ];

  const recentItems = [
    {
      icon: FileText,
      title: 'Getting Started Guide',
      workspace: 'Personal',
      lastModified: '2 hours ago',
      type: 'page',
    },
    {
      icon: Database,
      title: 'Project Tasks',
      workspace: 'Team Workspace',
      lastModified: '1 day ago',
      type: 'database',
    },
    {
      icon: FileText,
      title: 'Meeting Notes',
      workspace: 'Team Workspace',
      lastModified: '3 days ago',
      type: 'page',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-notion-gray-900 mb-3">
          Good morning! 👋
        </h1>
        <p className="text-lg text-notion-gray-600 max-w-2xl mx-auto">
          Welcome back to your collaborative workspace. Create, organize, and share your knowledge with ease.
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold text-notion-gray-900 mb-4 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="group p-6 bg-white border border-notion-gray-200 rounded-lg hover:border-notion-gray-300 hover:shadow-sm transition-all duration-200 text-left"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${action.color} mb-4`}>
                <action.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-notion-gray-900 mb-2 group-hover:text-notion-blue-600 transition-colors">
                {action.title}
              </h3>
              <p className="text-sm text-notion-gray-600">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-semibold text-notion-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Recent Activity
        </h2>
        <div className="bg-white border border-notion-gray-200 rounded-lg">
          {recentItems.length > 0 ? (
            <div className="divide-y divide-notion-gray-100">
              {recentItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-notion-gray-25 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-notion-gray-100 rounded-md flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-notion-gray-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-notion-gray-900 truncate">
                          {item.title}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-notion-gray-100 text-notion-gray-600">
                          {item.type}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-notion-gray-500 mt-1">
                        <span>{item.workspace}</span>
                        <span className="mx-1">•</span>
                        <span>{item.lastModified}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-notion-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-notion-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-notion-gray-900 mb-1">No recent activity</h3>
              <p className="text-sm text-notion-gray-600">
                Start by creating your first workspace or page
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Overview */}
      <section>
        <h2 className="text-xl font-semibold text-notion-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Your QuillBoard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-notion-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notion-gray-600">Workspaces</p>
                <p className="text-2xl font-semibold text-notion-gray-900">2</p>
              </div>
              <Users className="w-8 h-8 text-notion-blue-500" />
            </div>
          </div>
          <div className="bg-white border border-notion-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notion-gray-600">Pages</p>
                <p className="text-2xl font-semibold text-notion-gray-900">12</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white border border-notion-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-notion-gray-600">Databases</p>
                <p className="text-2xl font-semibold text-notion-gray-900">4</p>
              </div>
              <Database className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;