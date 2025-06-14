import React, { useState, useEffect } from 'react';
import { Policy } from '../types';

interface PolicyListProps {
  onSelectPolicy: (policyId: string) => void;
}

export const PolicyList: React.FC<PolicyListProps> = ({ onSelectPolicy }) => {
  const [policies, setPolicies] = useState<Policy[]>([
    {
      id: '1',
      name: 'rbac.rego',
      path: '/policies/rbac.rego',
      content: 'package rbac\n\ndefault allow = false\n\nallow {\n  input.user.role == "admin"\n}',
      description: 'Role-based access control policy',
      status: 'active',
      lastModified: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      author: 'admin',
      version: '1.2.0',
      tags: ['rbac', 'security', 'authorization'],
    },
    {
      id: '2',
      name: 'authorization.rego',
      path: '/policies/authorization.rego',
      content: 'package authorization\n\ndefault allow = false\n\nallow {\n  input.method == "GET"\n  input.path[0] == "public"\n}',
      description: 'General authorization policies',
      status: 'active',
      lastModified: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      author: 'developer',
      version: '1.0.1',
      tags: ['authorization', 'http'],
    },
    {
      id: '3',
      name: 'data-filter.rego',
      path: '/policies/data-filter.rego',
      content: 'package data_filter\n\nfiltered_data[x] {\n  x := input.data[_]\n  x.visibility == "public"\n}',
      description: 'Data filtering and privacy controls',
      status: 'draft',
      lastModified: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      author: 'developer',
      version: '0.1.0',
      tags: ['data', 'privacy', 'filtering'],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'disabled'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastModified' | 'status'>('lastModified');

  const filteredPolicies = policies
    .filter((policy) => {
      const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           policy.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           policy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastModified':
          return b.lastModified.getTime() - a.lastModified.getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusBadge = (status: Policy['status']) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      disabled: 'bg-red-100 text-red-800',
    };
    return badges[status];
  };

  const formatLastModified = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return date.toLocaleDateString('pl-PL');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Policies</h2>
          <p className="text-gray-600 mt-2">
            Manage your OPA policies ({filteredPolicies.length} of {policies.length})
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
          <span className="mr-2">➕</span>
          Create Policy
        </button>
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
              placeholder="Search policies, descriptions, tags..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="lastModified">Last Modified</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Policy List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Policy Files</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredPolicies.map((policy) => (
            <div
              key={policy.id}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelectPolicy(policy.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      📄 {policy.name}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(policy.status)}`}>
                      {policy.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {policy.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-xs text-gray-400">
                      v{policy.version} • {policy.author} • {formatLastModified(policy.lastModified)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {policy.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPolicy(policy.id);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    title="Edit Policy"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement test functionality
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    title="Test Policy"
                  >
                    🧪
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Implement download functionality
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    title="Download Policy"
                  >
                    ⬇️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredPolicies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No policies found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}; 