'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignedToAgent?: string;
  createdAt: string;
}

interface AgentLog {
  id: string;
  agentName: string;
  action: string;
  taskId?: string;
  timestamp: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, statusRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/status'),
      ]);
      
      const tasksData = await tasksRes.json();
      const statusData = await statusRes.json();
      
      if (tasksData.success) {
        setTasks(tasksData.tasks || []);
        setLogs(tasksData.logs || []);
      }
      
      if (statusData.success) {
        setSystemStatus(statusData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();
      if (data.success) {
        setTitle('');
        setDescription('');
        setTimeout(fetchData, 500); // Refresh after brief delay
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-200 text-gray-700',
      analyzing: 'bg-blue-200 text-blue-700',
      ready: 'bg-yellow-200 text-yellow-700',
      in_progress: 'bg-purple-200 text-purple-700',
      completed: 'bg-green-200 text-green-700',
      failed: 'bg-red-200 text-red-700',
      blocked: 'bg-orange-200 text-orange-700',
    };
    return colors[status] || 'bg-gray-200 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      HIGH: 'text-red-600 font-bold',
      MEDIUM: 'text-yellow-600',
      LOW: 'text-gray-500',
    };
    return colors[priority] || 'text-gray-500';
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Agent Task Manager
          </h1>
          <p className="text-gray-600">
            Watch autonomous agents plan and execute tasks in real-time
          </p>
        </div>

        {/* System Status */}
        {systemStatus && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">System Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Agents</div>
                <div className="text-2xl font-bold">{systemStatus.agentStats?.total || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Idle Agents</div>
                <div className="text-2xl font-bold text-green-600">
                  {systemStatus.agentStats?.byStatus?.idle || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Busy Agents</div>
                <div className="text-2xl font-bold text-purple-600">
                  {systemStatus.agentStats?.byStatus?.busy || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Tasks</div>
                <div className="text-2xl font-bold">{systemStatus.taskStats?.total || 0}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Create Task */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Create Task</h2>
              <form onSubmit={createTask}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Build user authentication"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional details..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </form>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">
                Tasks ({tasks.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No tasks yet. Create one above!
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {task.assignedToAgent && (
                          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                            Agent assigned
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Agent Activity */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Agent Activity</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No agent activity yet
                  </p>
                ) : (
                  logs.slice().reverse().map((log) => (
                    <div
                      key={log.id}
                      className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm text-blue-700">
                          {log.agentName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{log.action}</p>
                      {log.taskId && (
                        <span className="text-xs text-gray-500">Task: {log.taskId.slice(0, 8)}...</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-2">Try These Examples:</h3>
          <ul className="space-y-1 text-sm">
            <li>• &quot;Build user authentication&quot; - Watch it decompose into subtasks</li>
            <li>• &quot;Create a login form&quot; - See focused implementation</li>
            <li>• &quot;Add API endpoint for users&quot; - Observe code generation</li>
            <li>• &quot;URGENT: Fix broken button&quot; - Note priority detection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
