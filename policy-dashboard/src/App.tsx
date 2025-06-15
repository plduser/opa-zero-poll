import React, { useState } from 'react';
import { PolicyEditor } from './components/PolicyEditor';
import { PolicyList } from './components/PolicyList';
import { PolicyTester } from './components/PolicyTester';
import { AuditHistory } from './components/AuditHistory';
import { Dashboard } from './components/Dashboard';

type ActiveTab = 'dashboard' | 'policies' | 'editor' | 'tester' | 'history';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'policies':
        return <PolicyList onSelectPolicy={setSelectedPolicy} />;
      case 'editor':
        return <PolicyEditor selectedPolicy={selectedPolicy} />;
      case 'tester':
        return <PolicyTester />;
      case 'history':
        return <AuditHistory />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🛡️ OPA Policy Dashboard
              </h1>
            </div>
            
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'policies', label: 'Policies', icon: '📋' },
                { id: 'editor', label: 'Editor', icon: '✏️' },
                { id: 'tester', label: 'Tester', icon: '🧪' },
                { id: 'history', label: 'History', icon: '📈' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border-primary-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
}

export default App;
