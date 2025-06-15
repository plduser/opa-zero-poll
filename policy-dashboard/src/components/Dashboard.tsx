import React, { useState, useEffect } from 'react';
import { DashboardStats } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPolicies: 12,
    activePolicies: 8,
    draftPolicies: 3,
    disabledPolicies: 1,
    recentTests: 24,
    testsPassing: 20,
    testsFailing: 4,
    lastDeployment: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  });

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: string;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  const recentActivities = [
    {
      id: 1,
      action: 'Policy updated',
      policy: 'rbac.rego',
      user: 'admin',
      time: '2 minutes ago',
      icon: '✏️',
    },
    {
      id: 2,
      action: 'Tests passed',
      policy: 'authorization.rego',
      user: 'system',
      time: '15 minutes ago',
      icon: '✅',
    },
    {
      id: 3,
      action: 'Policy created',
      policy: 'data-filter.rego',
      user: 'developer',
      time: '1 hour ago',
      icon: '📝',
    },
    {
      id: 4,
      action: 'Test failed',
      policy: 'validation.rego',
      user: 'system',
      time: '2 hours ago',
      icon: '❌',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-2">
          Overview of your OPA policy management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Policies"
          value={stats.totalPolicies}
          icon="📋"
          color="border-blue-500"
        />
        <StatCard
          title="Active Policies"
          value={stats.activePolicies}
          icon="✅"
          color="border-green-500"
        />
        <StatCard
          title="Draft Policies"
          value={stats.draftPolicies}
          icon="📝"
          color="border-yellow-500"
        />
        <StatCard
          title="Recent Tests"
          value={stats.recentTests}
          icon="🧪"
          color="border-purple-500"
          subtitle={`${stats.testsPassing} passing, ${stats.testsFailing} failing`}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.policy} by {activity.user}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  OPA Server
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ● Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  OPAL Server
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ● Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Git Repository
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ● Synced
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Last Deployment
                </span>
                <span className="text-sm text-gray-500">
                  {stats.lastDeployment?.toLocaleDateString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <span className="mr-2">📝</span>
              Create Policy
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <span className="mr-2">🧪</span>
              Run Tests
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <span className="mr-2">🔄</span>
              Sync Repository
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <span className="mr-2">📊</span>
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 