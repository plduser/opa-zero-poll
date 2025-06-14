import React, { useState } from 'react';
import { AuditEntry, GitCommit } from '../types';

export const AuditHistory: React.FC = () => {
  const [filterAction, setFilterAction] = useState<'all' | 'created' | 'updated' | 'deleted' | 'tested' | 'deployed'>('all');
  const [filterUser, setFilterUser] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock audit data
  const auditEntries: AuditEntry[] = [
    {
      id: '1',
      policyId: 'rbac.rego',
      action: 'updated',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      user: 'admin',
      details: 'Updated admin role permissions to include DELETE operations',
      commit: {
        hash: 'a1b2c3d',
        author: 'admin',
        message: 'feat(rbac): Add DELETE permission for admin role',
        date: new Date(Date.now() - 1000 * 60 * 30),
        filesChanged: ['policies/rbac.rego'],
      },
    },
    {
      id: '2',
      policyId: 'authorization.rego',
      action: 'tested',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      user: 'system',
      details: 'Automated test suite executed successfully - 15 tests passed',
    },
    {
      id: '3',
      policyId: 'data-filter.rego',
      action: 'created',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: 'developer',
      details: 'Created new data filtering policy for privacy compliance',
      commit: {
        hash: 'x7y8z9w',
        author: 'developer',
        message: 'feat(privacy): Add data filtering policy for GDPR compliance',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2),
        filesChanged: ['policies/data-filter.rego', 'docs/privacy-policy.md'],
      },
    },
    {
      id: '4',
      policyId: 'legacy-auth.rego',
      action: 'deleted',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      user: 'admin',
      details: 'Removed deprecated legacy authentication policy',
      commit: {
        hash: 'p9q8r7s',
        author: 'admin',
        message: 'chore: Remove deprecated legacy-auth policy',
        date: new Date(Date.now() - 1000 * 60 * 60 * 6),
        filesChanged: ['policies/legacy-auth.rego'],
      },
    },
    {
      id: '5',
      policyId: 'rbac.rego',
      action: 'deployed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      user: 'system',
      details: 'Policy successfully deployed to production environment',
    },
  ];

  const filteredEntries = auditEntries.filter((entry) => {
    const matchesAction = filterAction === 'all' || entry.action === filterAction;
    const matchesUser = filterUser === 'all' || entry.user === filterUser;
    const matchesSearch = searchTerm === '' || 
                         entry.policyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.commit?.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesAction && matchesUser && matchesSearch;
  });

  const uniqueUsers = Array.from(new Set(auditEntries.map(entry => entry.user)));

  const getActionIcon = (action: AuditEntry['action']) => {
    const icons = {
      created: '➕',
      updated: '✏️',
      deleted: '🗑️',
      tested: '🧪',
      deployed: '🚀',
    };
    return icons[action];
  };

  const getActionColor = (action: AuditEntry['action']) => {
    const colors = {
      created: 'text-green-600',
      updated: 'text-blue-600',
      deleted: 'text-red-600',
      tested: 'text-purple-600',
      deployed: 'text-orange-600',
    };
    return colors[action];
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Audit History</h2>
        <p className="text-gray-600 mt-2">
          Track all changes and activities in your policy management system
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search policies, commits, details..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Action Filter */}
          <div>
            <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              id="action"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="tested">Tested</option>
              <option value="deployed">Deployed</option>
            </select>
          </div>

          {/* User Filter */}
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
              User
            </label>
            <select
              id="user"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Activity Timeline ({filteredEntries.length} entries)
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                {/* Action Icon */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">{getActionIcon(entry.action)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getActionColor(entry.action)} capitalize`}>
                      {entry.action}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm font-medium text-gray-900">
                      {entry.policyId}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      by {entry.user}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    {entry.details}
                  </p>

                  {/* Git Commit Info */}
                  {entry.commit && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="font-mono text-gray-700 bg-white px-2 py-1 rounded border">
                          {entry.commit.hash}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-700">{entry.commit.message}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Files changed: {entry.commit.filesChanged.join(', ')}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-400">
                    {formatTimestamp(entry.timestamp)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0">
                  <div className="flex space-x-2">
                    {entry.commit && (
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        title="View Commit"
                      >
                        🔗
                      </button>
                    )}
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      title="View Details"
                    >
                      👁️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-gray-500">No audit entries found matching your criteria.</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {(['created', 'updated', 'deleted', 'tested', 'deployed'] as const).map((action) => {
          const count = auditEntries.filter(entry => entry.action === action).length;
          return (
            <div key={action} className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl mb-1">{getActionIcon(action)}</div>
              <div className="text-2xl font-semibold text-gray-900">{count}</div>
              <div className="text-sm text-gray-500 capitalize">{action}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 