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
  const [lastLogId, setLastLogId] = useState<string>('');

  useEffect(() => {
    fetchData();
    // Welcome message for browser console
    console.log('%c🤖 AI Agent Task Manager', 'color: #3b82f6; font-size: 20px; font-weight: bold');
    console.log('%cAgent activity will be logged here in real-time', 'color: #6b7280; font-style: italic');
    console.log('%cCreate a task to see the agents in action!', 'color: #8b5cf6; font-weight: bold');
    console.log('---');
    
    const interval = setInterval(fetchData, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Browser console logging for agent activity
  useEffect(() => {
    if (logs.length > 0) {
      const latestLog = logs[logs.length - 1];
      if (latestLog.id !== lastLogId) {
        const emoji = latestLog.agentName.includes('Planning') ? '📋' : '⚙️';
        console.log(`%c${emoji} ${latestLog.agentName}%c | ${latestLog.action}`, 
          'color: #3b82f6; font-weight: bold', 
          'color: #6b7280');
        setLastLogId(latestLog.id);
      }
    }
  }, [logs, lastLogId]);

  // Log task status changes
  useEffect(() => {
    tasks.forEach(task => {
      const statusEmoji = {
        pending: '⏳',
        analyzing: '🔍',
        ready: '📌',
        in_progress: '⚡',
        completed: '✅',
        failed: '❌',
        blocked: '🚫'
      }[task.status] || '📝';
      
      if (task.status === 'analyzing' || task.status === 'in_progress') {
        console.log(`%c${statusEmoji} Task Status%c | "${task.title}" → ${task.status}`, 
          'color: #8b5cf6; font-weight: bold', 
          'color: #6b7280');
      } else if (task.status === 'completed') {
        console.log(`%c✅ Task Completed%c | "${task.title}"`, 
          'color: #10b981; font-weight: bold', 
          'color: #6b7280');
      }
    });
  }, [tasks]);

  // Log system status
  useEffect(() => {
    if (systemStatus?.agentStats?.byStatus?.busy > 0) {
      console.log(`%c🤖 System%c | ${systemStatus.agentStats.byStatus.busy} agent(s) working`, 
        'color: #10b981; font-weight: bold', 
        'color: #6b7280');
    }
  }, [systemStatus?.agentStats?.byStatus?.busy]);

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
      pending: 'bg-gray-100 text-gray-700 border border-gray-300',
      analyzing: 'bg-blue-100 text-blue-700 border border-blue-300',
      ready: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
      in_progress: 'bg-purple-100 text-purple-700 border border-purple-300',
      completed: 'bg-green-100 text-green-700 border border-green-300',
      failed: 'bg-red-100 text-red-700 border border-red-300',
      blocked: 'bg-orange-100 text-orange-700 border border-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const isTaskActive = (status: string) => {
    return ['analyzing', 'ready', 'in_progress'].includes(status);
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      HIGH: 'bg-red-100 text-red-700 border border-red-300',
      MEDIUM: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
      LOW: 'bg-gray-100 text-gray-600 border border-gray-300',
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const loadDemoTasks = async () => {
    const demoTasks = [
      { title: 'Build user authentication', description: 'Complete auth system with login and signup' },
      { title: 'Create contact form component', description: 'React component with validation' },
      { title: 'URGENT: Fix homepage button', description: 'Button not responding to clicks' },
    ];

    for (const task of demoTasks) {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setTimeout(fetchData, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid currentColor;
          border-right-color: transparent;
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }
        .spinner-lg {
          width: 16px;
          height: 16px;
          border-width: 3px;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                🤖 AI Agent Task Manager
              </h1>
              <p className="text-gray-600 text-lg">
                Watch autonomous agents plan and execute tasks in real-time
              </p>
            </div>
            <button
              onClick={loadDemoTasks}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 font-medium shadow-lg hover:shadow-xl transition-all"
            >
              🎬 Load Demo Tasks
            </button>
          </div>
        </div>

        {/* System Status */}
        {systemStatus && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span> System Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Agents</div>
                <div className="text-3xl font-bold text-blue-600">
                  {systemStatus.agentStats?.total || 0}
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Idle Agents</div>
                <div className="text-3xl font-bold text-green-600">
                  {systemStatus.agentStats?.byStatus?.idle || 0}
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Busy Agents</div>
                <div className="text-3xl font-bold text-purple-600 flex items-center">
                  {systemStatus.agentStats?.byStatus?.busy || 0}
                  {(systemStatus.agentStats?.byStatus?.busy || 0) > 0 && (
                    <span className="spinner spinner-lg text-purple-500" style={{ marginLeft: '8px' }}></span>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Tasks</div>
                <div className="text-3xl font-bold text-orange-600">
                  {systemStatus.taskStats?.total || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Create Task */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span> Create Task
              </h2>
              <form onSubmit={createTask}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Additional details..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? '⏳ Creating...' : '🚀 Create Task'}
                </button>
              </form>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span> Tasks ({tasks.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-gray-500 font-medium">No tasks yet</p>
                    <p className="text-gray-400 text-sm">Create one above or load demo tasks!</p>
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border-2 border-gray-100 rounded-lg p-4 hover:shadow-md hover:border-blue-200 transition-all bg-gradient-to-r from-white to-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{task.title}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center ${getStatusColor(task.status)}`}>
                          {isTaskActive(task.status) && (
                            <span className="spinner" style={{ marginRight: '6px' }}></span>
                          )}
                          {task.status}
                        </span>
                        {task.assignedToAgent && (
                          <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                            🤖 Agent assigned
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
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🔄</span> Agent Activity
                {systemStatus?.agentStats?.byStatus?.busy > 0 && (
                  <span className="spinner spinner-lg text-blue-500" style={{ marginLeft: '8px' }}></span>
                )}
              </h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💤</div>
                    <p className="text-gray-500 font-medium">No agent activity yet</p>
                    <p className="text-gray-400 text-sm">Create a task to see agents in action!</p>
                  </div>
                ) : (
                  logs.slice().reverse().map((log) => (
                    <div
                      key={log.id}
                      className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 rounded-r-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-blue-700">
                          🤖 {log.agentName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{log.action}</p>
                      {log.taskId && (
                        <span className="text-xs text-gray-500 mt-1 inline-block">
                          Task: {log.taskId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <span className="text-xl">💡</span> Try These Examples:
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <div className="font-semibold text-sm text-blue-700 mb-1">Complex Task</div>
              <div className="text-sm text-gray-700">&quot;Build user authentication&quot;</div>
              <div className="text-xs text-gray-500 mt-1">→ Decomposes into 7 subtasks</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <div className="font-semibold text-sm text-purple-700 mb-1">Simple Task</div>
              <div className="text-sm text-gray-700">&quot;Create a login form&quot;</div>
              <div className="text-xs text-gray-500 mt-1">→ Single focused implementation</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-100">
              <div className="font-semibold text-sm text-green-700 mb-1">API Task</div>
              <div className="text-sm text-gray-700">&quot;Add API endpoint for users&quot;</div>
              <div className="text-xs text-gray-500 mt-1">→ Code generation demo</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-red-100">
              <div className="font-semibold text-sm text-red-700 mb-1">Priority Detection</div>
              <div className="text-sm text-gray-700">&quot;URGENT: Fix broken button&quot;</div>
              <div className="text-xs text-gray-500 mt-1">→ Auto-assigned HIGH priority</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
