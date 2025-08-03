import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to QuillBoard</h1>
        <p className="text-gray-600">Your collaborative workspace for notes, documents, and databases.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-indigo-500">
          <div className="flex items-center">
            <i className="fas fa-layer-group text-indigo-500 text-xl mr-3"></i>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Workspaces</h3>
              <p className="text-gray-600">Organize your projects</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <i className="fas fa-file-alt text-green-500 text-xl mr-3"></i>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pages</h3>
              <p className="text-gray-600">Create and edit documents</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <i className="fas fa-database text-blue-500 text-xl mr-3"></i>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Databases</h3>
              <p className="text-gray-600">Manage structured data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 py-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Welcome to QuillBoard! Start by creating your first workspace.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;