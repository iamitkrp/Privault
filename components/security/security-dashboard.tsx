'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { SecurityMonitoringService, type SecurityEventLog, type SecurityAlert } from '@/services/security-monitoring.service';
import { SessionManagementService, type UserSession } from '@/services/session-management.service';

interface SecurityDashboardProps {
  className?: string;
}

interface SecuritySummary {
  riskLevel: 'low' | 'medium' | 'high';
  activeAlerts: number;
  activeSessions: number;
  recentEvents: number;
  lastActivity: string | null;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  devicesUsed: number;
  lastActivity: string | null;
  averageSessionDuration: number;
}

export default function SecurityDashboard({ className = '' }: SecurityDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'sessions' | 'settings'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [securitySummary, setSecuritySummary] = useState<SecuritySummary>({
    riskLevel: 'low',
    activeAlerts: 0,
    activeSessions: 0,
    recentEvents: 0,
    lastActivity: null
  });
  const [securityEvents, setSecurityEvents] = useState<SecurityEventLog[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);

  // Settings state
  const [autoLockTimeout, setAutoLockTimeout] = useState(15); // minutes
  const [settingsLoading, setSettingsLoading] = useState(false);

  const loadSecurityData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Load all security data in parallel
      const [
        report,
        sessions,
        stats
      ] = await Promise.all([
        SecurityMonitoringService.generateSecurityReport(user.id),
        SessionManagementService.getActiveSessions(user.id),
        SessionManagementService.getSessionStatistics(user.id)
      ]);

      // Update summary
      setSecuritySummary({
        riskLevel: report.summary.riskLevel,
        activeAlerts: report.summary.activeAlerts,
        activeSessions: sessions.length,
        recentEvents: report.events.filter(e => 
          new Date(e.timestamp).getTime() > Date.now() - (24 * 60 * 60 * 1000)
        ).length,
        lastActivity: report.summary.lastActivity
      });

      setSecurityEvents(report.events);
      setSecurityAlerts(report.alerts);
      setActiveSessions(sessions);
      setSessionStats(stats);

    } catch (error) {
      console.error('Failed to load security data:', error);
      setError('Failed to load security information');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSecurityData();
    }
  }, [user, loadSecurityData]);

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const result = await SessionManagementService.terminateSession(sessionId, 'terminated_by_user');
      if (result.success) {
        // Reload sessions
        const sessions = await SessionManagementService.getActiveSessions(user!.id);
        setActiveSessions(sessions);
      } else {
        setError(result.error || 'Failed to terminate session');
      }
    } catch (error) {
      console.error('Failed to terminate session:', error);
      setError('Failed to terminate session');
    }
  };

  const handleTerminateAllSessions = async () => {
    if (!user) return;
    
    try {
      const result = await SessionManagementService.terminateAllOtherSessions(user.id, true);
      if (result.success) {
        // Reload sessions
        const sessions = await SessionManagementService.getActiveSessions(user.id);
        setActiveSessions(sessions);
        alert(`Successfully terminated ${result.terminatedCount} sessions`);
      } else {
        setError(result.error || 'Failed to terminate sessions');
      }
    } catch (error) {
      console.error('Failed to terminate sessions:', error);
      setError('Failed to terminate sessions');
    }
  };

  const handleUpdateAutoLockTimeout = async () => {
    if (!user) return;

    try {
      setSettingsLoading(true);
      const timeoutMs = autoLockTimeout * 60 * 1000;
      
      const result = await SessionManagementService.updateSessionConfig(user.id, {
        autoLockTimeout: timeoutMs
      });

      if (result.success) {
        alert('Auto-lock timeout updated successfully');
      } else {
        setError(result.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      setError('Failed to update settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100';
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatEventType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-500">
        Please log in to view security dashboard
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading security information...</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Security Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          Monitor your account security and manage sessions
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px px-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'events', label: 'Security Events' },
            { id: 'sessions', label: 'Active Sessions' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Security Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Risk Level</p>
                    <p className={`text-lg font-semibold capitalize px-2 py-1 rounded-full text-xs ${getRiskLevelColor(securitySummary.riskLevel)}`}>
                      {securitySummary.riskLevel}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRiskLevelColor(securitySummary.riskLevel)}`}>
                    🛡️
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                    <p className="text-2xl font-bold text-gray-900">{securitySummary.activeAlerts}</p>
                  </div>
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                    ⚠️
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{securitySummary.activeSessions}</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    📱
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recent Events</p>
                    <p className="text-2xl font-bold text-gray-900">{securitySummary.recentEvents}</p>
                  </div>
                  <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    📊
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            {securityAlerts.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Security Alerts</h3>
                <div className="space-y-3">
                  {securityAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {alert.alert_type.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(alert.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Security Events</h3>
              <button
                onClick={loadSecurityData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Refresh
              </button>
            </div>
            
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {securityEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatEventType(event.event_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTimeAgo(event.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {event.ip_address && (
                          <div>IP: {event.ip_address}</div>
                        )}
                        {Object.keys(event.event_data).length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {JSON.stringify(event.event_data)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Active Sessions</h3>
              <div className="space-x-2">
                <button
                  onClick={loadSecurityData}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Refresh
                </button>
                <button
                  onClick={handleTerminateAllSessions}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Terminate All Others
                </button>
              </div>
            </div>

            {sessionStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionStats.totalSessions}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Devices Used</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionStats.devicesUsed}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Avg Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(sessionStats.averageSessionDuration / (1000 * 60))}m
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{session.device_name}</span>
                        <span className="text-sm text-gray-500">
                          ({session.device_info.platform})
                        </span>
                        {session.session_id === SessionManagementService.getCurrentSession()?.session_id && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Last activity: {formatTimeAgo(session.last_activity)}
                      </p>
                      <div className="text-xs text-gray-400 mt-1 space-y-1">
                        <div>Location: {session.device_info.timezone}</div>
                        <div>Screen: {session.device_info.screenResolution}</div>
                        {session.ip_address && <div>IP: {session.ip_address}</div>}
                      </div>
                    </div>
                    <div className="ml-4">
                      {session.session_id !== SessionManagementService.getCurrentSession()?.session_id && (
                        <button
                          onClick={() => handleTerminateSession(session.session_id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Terminate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
            
            {/* Auto-lock timeout */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-lock Timeout
              </label>
              <div className="flex items-center space-x-4">
                <select
                  value={autoLockTimeout}
                  onChange={(e) => setAutoLockTimeout(Number(e.target.value))}
                  className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
                <button
                  onClick={handleUpdateAutoLockTimeout}
                  disabled={settingsLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
                >
                  {settingsLoading ? 'Updating...' : 'Update'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Automatically lock your vault after this period of inactivity
              </p>
            </div>

            {/* Session Statistics */}
            {sessionStats && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Session Statistics</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Sessions:</span>
                    <span className="ml-2 font-medium">{sessionStats.totalSessions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Active Sessions:</span>
                    <span className="ml-2 font-medium">{sessionStats.activeSessions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Devices Used:</span>
                    <span className="ml-2 font-medium">{sessionStats.devicesUsed}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Activity:</span>
                    <span className="ml-2 font-medium">
                      {sessionStats.lastActivity ? formatTimeAgo(sessionStats.lastActivity) : 'Never'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 