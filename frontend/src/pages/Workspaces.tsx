import React from 'react';

const Workspaces: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Workspaces</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <i className="fas fa-plus mr-2"></i>
          New Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample workspace card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">📝</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sample Workspace</h3>
              <p className="text-sm text-gray-500">3 pages • 2 databases</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            This is a sample workspace to get you started. Create your first workspace to begin organizing your content.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              <img
                className="w-8 h-8 rounded-full border-2 border-white"
                src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff"
                alt="User"
              />
            </div>
            <span className="text-xs text-gray-500">Updated 2 days ago</span>
          </div>
        </div>

        {/* New workspace card */}
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center hover:border-gray-400 transition-colors cursor-pointer">
          <div className="text-4xl text-gray-400 mb-4">
            <i className="fas fa-plus-circle"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Workspace</h3>
          <p className="text-sm text-gray-500">Start a new project or organize your content</p>
        </div>
      </div>
    </div>
  );
};

export default Workspaces;